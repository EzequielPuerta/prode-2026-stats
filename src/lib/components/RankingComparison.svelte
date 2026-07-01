<script lang="ts">
	import PointsBarChart from './plots/PointsBarChart.svelte';
	import PointsHistogramChart from './plots/PointsHistogramChart.svelte';
	import DiffChart from './plots/DiffChart.svelte';
	import { rankingDifferences, computeStandings } from '$lib/scoring';
	import { playedMatchIndices } from '$lib/predictions';
	import { coefficientOfVariation, giniCoefficient } from '$lib/stats';
	import type { ParsedProde, ParsedDoubles, Scenario, Standing, ComparisonRow } from '$lib/types';

	const HISTOGRAM_BUCKET_SIZE = 5;

	let {
		parsed,
		doubles,
		throughCount,
		base,
		target,
		standings,
		hoveredPlayer = $bindable(null)
	}: {
		parsed: ParsedProde;
		doubles: ParsedDoubles | null;
		throughCount: number;
		base: Scenario;
		target: Scenario;
		standings: Standing[];
		hoveredPlayer?: string | null;
	} = $props();

	const rows = $derived.by(() => {
		const diffs = rankingDifferences(parsed, doubles, throughCount, base.config, target.config);
		const pointsByName = new Map(standings.map((s) => [s.name, s.points]));
		return diffs.map((r): ComparisonRow => ({ ...r, points: pointsByName.get(r.name) ?? 0 }));
	});

	const orderedNames = $derived(rows.map((r) => r.name));

	const chartBounds = $derived.by(() => {
		const totalPlayed = playedMatchIndices(parsed).length;
		let maxPoints = 0;
		let maxHistogramCount = 0;
		for (let i = 1; i <= totalPlayed; i++) {
			const points = computeStandings(parsed, doubles, i, target.config).map((s) => s.points);
			if (points.length === 0) continue;
			maxPoints = Math.max(maxPoints, ...points);
			const bucketCount = Math.floor(Math.max(...points) / HISTOGRAM_BUCKET_SIZE) + 1;
			const counts = new Array(bucketCount).fill(0);
			for (const p of points) {
				const idx = Math.min(Math.floor(p / HISTOGRAM_BUCKET_SIZE), bucketCount - 1);
				counts[idx]++;
			}
			maxHistogramCount = Math.max(maxHistogramCount, ...counts);
		}
		return { maxPoints, maxHistogramCount };
	});

	const stats = $derived.by(() => {
		if (rows.length === 0) return null;
		const diffs = rows.map((r) => r.diff);
		const abs = diffs.map(Math.abs);
		const mean = abs.reduce((a, b) => a + b, 0) / abs.length;
		const sorted = [...abs].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
		const affected = diffs.filter((d) => d !== 0).length;
		const riser = rows.reduce((best, r) => (r.diff > best.diff ? r : best), rows[0]);
		const faller = rows.reduce((worst, r) => (r.diff < worst.diff ? r : worst), rows[0]);
		const points = rows.map((r) => r.points);
		const cv = coefficientOfVariation(points);
		const gini = giniCoefficient(points);
		return { mean, median, affected, total: rows.length, riser, faller, cv, gini };
	});

	let histogramMode = $state(false);

	let wrapHeight = $state(0);
	const chartHeight = $derived(Math.max(180, wrapHeight));

	let histWrapHeight = $state(0);
	const histChartHeight = $derived(Math.max(180, histWrapHeight));
</script>

<div class="flex h-full flex-col gap-4">
	{#if stats}
		<div class="stats stats-horizontal w-full shrink-0 overflow-x-auto shadow">
			<div class="stat w-32 px-4 py-3 lg:w-38 lg:px-6 lg:py-4">
				<div class="stat-title truncate text-xs lg:text-sm">Dif. prom. abs.</div>
				<div class="stat-value text-lg lg:text-2xl">{stats.mean.toFixed(1)}</div>
				<div class="stat-desc truncate">posiciones |Δ|</div>
			</div>
			<div class="stat w-28 px-4 py-3 lg:w-38 lg:px-6 lg:py-4">
				<div class="stat-title truncate text-xs lg:text-sm">Mediana abs.</div>
				<div class="stat-value text-lg lg:text-2xl">{stats.median}</div>
				<div class="stat-desc truncate">posiciones |Δ|</div>
			</div>
			<div class="stat w-28 px-4 py-3 lg:w-38 lg:px-6 lg:py-4">
				<div class="stat-title truncate text-xs lg:text-sm">Mayor subida</div>
				<div class="stat-value text-success text-lg lg:text-2xl">+{stats.riser.diff}</div>
				<div class="stat-desc max-w-[12ch] truncate">{stats.riser.name}</div>
			</div>
			<div class="stat w-28 px-4 py-3 lg:w-38 lg:px-6 lg:py-4">
				<div class="stat-title truncate text-xs lg:text-sm">Mayor caída</div>
				<div class="stat-value text-error text-lg lg:text-2xl">{stats.faller.diff}</div>
				<div class="stat-desc max-w-[12ch] truncate">{stats.faller.name}</div>
			</div>
			<div class="stat w-28 px-4 py-3 lg:w-38 lg:px-6 lg:py-4">
				<div class="stat-title truncate text-xs lg:text-sm">Afectados</div>
				<div class="stat-value text-lg lg:text-2xl">{stats.affected}/{stats.total}</div>
				<div class="stat-desc truncate">cambian pos.</div>
			</div>
			<div
				class="stat w-28 px-4 py-3 lg:w-38 lg:px-6 lg:py-4"
				title="Desvío estándar relativo a la media de puntos. Cuanto más alto, más dispersos están los puntajes entre los jugadores."
			>
				<div class="stat-title truncate text-xs lg:text-sm">Coef. variación</div>
				<div class="stat-value text-lg lg:text-2xl">{(stats.cv * 100).toFixed(0)}%</div>
				<div class="stat-desc truncate">dispersión relativa pts.</div>
			</div>
			<div
				class="stat w-28 px-4 py-3 lg:w-38 lg:px-6 lg:py-4"
				title="Mide qué tan concentrados están los puntos: 0 significa que todos los jugadores tienen puntajes parejos, 1 que unos pocos concentran la mayoría de los puntos."
			>
				<div class="stat-title truncate text-xs lg:text-sm">Gini</div>
				<div class="stat-value text-lg lg:text-2xl">{stats.gini.toFixed(2)}</div>
				<div class="stat-desc truncate">concentración pts.</div>
			</div>
		</div>
	{/if}

	<div class="relative min-h-0 flex-1" bind:clientHeight={histWrapHeight}>
		{#if histogramMode}
			<PointsHistogramChart
				{rows}
				height={histChartHeight}
				bind:histogramMode
				{hoveredPlayer}
				maxCount={chartBounds.maxHistogramCount}
			/>
		{:else}
			<PointsBarChart
				{rows}
				{orderedNames}
				height={histChartHeight}
				targetLabel={target.label}
				bind:hoveredPlayer
				bind:histogramMode
				maxPoints={chartBounds.maxPoints}
			/>
		{/if}
	</div>

	<div class="relative min-h-0 flex-1" bind:clientHeight={wrapHeight}>
		<DiffChart
			{rows}
			{orderedNames}
			height={chartHeight}
			baseLabel={base.label}
			targetLabel={target.label}
			bind:hoveredPlayer
		/>
	</div>
</div>
