<script lang="ts">
	import { Plot, BarY, RuleY } from 'svelteplot';
	import PlotProbe from './PlotProbe.svelte';
	import { rankingDifferences } from '$lib/scoring';
	import type { ParsedProde, ParsedDoubles, Scenario } from '$lib/types';

	let {
		parsed,
		doubles,
		throughCount,
		base,
		target,
		hoveredPlayer = $bindable(null)
	}: {
		parsed: ParsedProde;
		doubles: ParsedDoubles | null;
		throughCount: number;
		base: Scenario;
		target: Scenario;
		hoveredPlayer?: string | null;
	} = $props();

	function shortName(name: string): string {
		const parts = name.trim().split(/\s+/);
		if (parts.length === 1) return parts[0];
		return `${parts[0]} ${parts[parts.length - 1][0]}.`;
	}

	type Row = {
		name: string;
		baseRank: number;
		targetRank: number;
		diff: number;
		dir: 'Sube' | 'Baja' | 'Igual';
	};

	const rows = $derived(
		rankingDifferences(parsed, doubles, throughCount, base.config, target.config).map(
			(r): Row => ({
				...r,
				dir: r.diff > 0 ? 'Sube' : r.diff < 0 ? 'Baja' : 'Igual'
			})
		)
	);

	const orderedNames = $derived(rows.map((r) => r.name));
	const yDomain = [15, -25];

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
		return { mean, median, affected, total: rows.length, riser, faller };
	});

	let wrapHeight = $state(0);
	const chartHeight = $derived(Math.max(350, wrapHeight));

	type Scales = {
		x: { fn: ((v: unknown) => number) & { bandwidth?: () => number } };
		y: { fn: (v: number) => number };
	};
	let scales = $state<Scales | null>(null);

	const tooltip = $derived.by(() => {
		if (!hoveredPlayer || !scales) return null;
		const row = rows.find((r) => r.name === hoveredPlayer);
		if (!row) return null;
		const bandwidth = scales.x.fn.bandwidth?.() ?? 0;
		const x = scales.x.fn(row.name) + bandwidth / 2;
		const y = scales.y.fn(Math.max(row.diff, 0));
		return { row, x, y };
	});
</script>

<div class="flex h-full flex-col gap-4">
	{#if stats}
		<div class="stats stats-vertical sm:stats-horizontal w-full shrink-0 shadow">
			<div class="stat">
				<div class="stat-title">Diferencia promedio abs.</div>
				<div class="stat-value text-2xl">{stats.mean.toFixed(1)}</div>
				<div class="stat-desc">posiciones |Δ|</div>
			</div>
			<div class="stat">
				<div class="stat-title">Mediana abs.</div>
				<div class="stat-value text-2xl">{stats.median}</div>
				<div class="stat-desc">posiciones |Δ|</div>
			</div>
			<div class="stat">
				<div class="stat-title">Mayor subida</div>
				<div class="stat-value text-success text-2xl">+{stats.riser.diff}</div>
				<div class="stat-desc max-w-[12ch] truncate">{stats.riser.name}</div>
			</div>
			<div class="stat">
				<div class="stat-title">Mayor caída</div>
				<div class="stat-value text-error text-2xl">{stats.faller.diff}</div>
				<div class="stat-desc max-w-[12ch] truncate">{stats.faller.name}</div>
			</div>
			<div class="stat">
				<div class="stat-title">Afectados</div>
				<div class="stat-value text-2xl">{stats.affected}/{stats.total}</div>
				<div class="stat-desc">cambian de puesto</div>
			</div>
		</div>
	{/if}

	<div class="relative min-h-0 flex-1" bind:clientHeight={wrapHeight}>
		<Plot
			height={chartHeight}
			marginBottom={92}
			marginLeft={40}
			x={{
				domain: orderedNames,
				tickFormat: (d: unknown) => shortName(String(d)),
				tickRotate: -90,
				label: false
			}}
			y={{ label: 'Δ posición', grid: true, domain: yDomain }}
			color={{
				domain: ['Sube', 'Baja', 'Igual'],
				range: ['var(--color-success)', 'var(--color-error)', 'var(--color-base-300)']
			}}
		>
			<PlotProbe onscales={(s) => (scales = s as Scales)} />
			<RuleY data={[0]} />
			<BarY data={rows} x="name" y="diff" fill="dir" />
			<!-- Barras transparentes de alto completo: zona de hover para el tooltip. -->
			<BarY
				data={rows}
				x="name"
				y1={() => yDomain[0]}
				y2={() => yDomain[1]}
				fill="black"
				fillOpacity={0}
				class="cursor-pointer"
				onmouseenter={(_e, d) => (hoveredPlayer = d.name)}
				onmouseleave={() => (hoveredPlayer = null)}
			/>
		</Plot>

		{#if tooltip}
			<div
				class="bg-base-100 border-base-300 rounded-box pointer-events-none absolute z-20 border p-2 text-xs shadow-lg"
				style="left: {tooltip.x}px; top: {tooltip.y}px; transform: translate(-50%, calc(-100% - 14px));"
			>
				<div class="mb-1 font-semibold">{tooltip.row.name}</div>
				<div class="text-base-content/70">
					{base.label}: <span class="text-base-content font-medium">{tooltip.row.baseRank}º</span>
				</div>
				<div class="text-base-content/70">
					{target.label}: <span class="text-base-content font-medium">{tooltip.row.targetRank}º</span>
				</div>
				<div
					class="mt-1 font-semibold {tooltip.row.diff > 0
						? 'text-success'
						: tooltip.row.diff < 0
							? 'text-error'
							: 'text-base-content/60'}"
				>
					{tooltip.row.diff > 0 ? '+' : ''}{tooltip.row.diff} posiciones
				</div>
			</div>
		{/if}
	</div>
</div>
