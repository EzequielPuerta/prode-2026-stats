<script lang="ts">
	import { Plot, BarY } from 'svelteplot';
	import PlotProbe from '../PlotProbe.svelte';
	import type { ComparisonRow } from '$lib/types';

	let {
		rows,
		height,
		bucketSize = 5,
		hoveredPlayer = null,
		histogramMode = $bindable(false)
	}: {
		rows: ComparisonRow[];
		height: number;
		bucketSize?: number;
		hoveredPlayer?: string | null;
		histogramMode?: boolean;
	} = $props();

	type Bucket = { label: string; start: number; end: number; players: ComparisonRow[] };

	const buckets = $derived.by((): Bucket[] => {
		if (rows.length === 0) return [];
		const maxPoints = Math.max(...rows.map((r) => r.points));
		const bucketCount = Math.floor(maxPoints / bucketSize) + 1;
		const list: Bucket[] = Array.from({ length: bucketCount }, (_, i) => ({
			label: `${i * bucketSize}-${i * bucketSize + bucketSize - 1}`,
			start: i * bucketSize,
			end: i * bucketSize + bucketSize - 1,
			players: []
		}));
		for (const row of rows) {
			const idx = Math.min(Math.floor(row.points / bucketSize), bucketCount - 1);
			list[idx].players.push(row);
		}
		return list;
	});

	const bucketLabels = $derived(buckets.map((b) => b.label));
	const maxCount = $derived(buckets.length ? Math.max(...buckets.map((b) => b.players.length)) : 0);
	const yDomain = $derived([0, maxCount * 1.15 || 1]);

	const hoveredBucketLabel = $derived.by(() => {
		if (!hoveredPlayer) return null;
		return buckets.find((b) => b.players.some((p) => p.name === hoveredPlayer))?.label ?? null;
	});

	let hoveredBucketLocal = $state<string | null>(null);

	type Scales = {
		x: { fn: ((v: unknown) => number) & { bandwidth?: () => number } };
		y: { fn: (v: number) => number };
	};
	let scales = $state<Scales | null>(null);

	const tooltip = $derived.by(() => {
		if (!hoveredBucketLocal || !scales) return null;
		const bucket = buckets.find((b) => b.label === hoveredBucketLocal);
		if (!bucket) return null;
		const bandwidth = scales.x.fn.bandwidth?.() ?? 0;
		const x = scales.x.fn(bucket.label) + bandwidth / 2;
		const y = scales.y.fn(bucket.players.length);
		return { bucket, x, y };
	});
</script>

<label
	class="bg-base-100/80 border-base-300 rounded-box absolute top-2 right-2 z-30 flex items-center gap-1.5 border px-2 py-1 shadow"
	title="Histograma real"
>
	<svg viewBox="0 0 20 20" fill="currentColor" class="text-base-content/70 size-4">
		<path
			d="M2 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-6ZM8 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7ZM14 3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V3Z"
		/>
	</svg>
	<input type="checkbox" class="toggle toggle-xs" bind:checked={histogramMode} />
</label>

<Plot
	{height}
	marginBottom={40}
	marginLeft={40}
	x={{ domain: bucketLabels, label: 'Puntos' }}
	y={{ label: 'Jugadores', grid: true, domain: yDomain }}
>
	<PlotProbe onscales={(s) => (scales = s as Scales)} />
	<BarY
		data={buckets}
		x="label"
		y={(b: Bucket) => b.players.length}
		fill={(b: Bucket) => (b.label === hoveredBucketLabel ? 'white' : 'var(--color-primary)')}
	/>
	<!-- Barras transparentes de alto completo: zona de hover para el tooltip. -->
	<BarY
		data={buckets}
		x="label"
		y1={() => yDomain[0]}
		y2={() => yDomain[1]}
		fill="black"
		fillOpacity={0}
		class="cursor-pointer"
		onmouseenter={(_e, b) => (hoveredBucketLocal = b.label)}
		onmouseleave={() => (hoveredBucketLocal = null)}
	/>
</Plot>

{#if tooltip}
	<div
		class="bg-base-100 border-base-300 rounded-box pointer-events-none absolute z-20 border p-2 text-xs shadow-lg"
		style="left: {tooltip.x}px; top: {tooltip.y}px; transform: translate(-50%, calc(-100% - 14px));"
	>
		<div class="mb-1 font-semibold">{tooltip.bucket.start}-{tooltip.bucket.end} pts</div>
		<div class="text-base-content/70">
			{tooltip.bucket.players.length}
			{tooltip.bucket.players.length === 1 ? 'jugador' : 'jugadores'}
		</div>
		{#if tooltip.bucket.players.length > 0 && tooltip.bucket.players.length <= 5}
			<ul class="mt-1">
				{#each tooltip.bucket.players as p (p.name)}
					<li class="text-base-content/70">
						{p.name}: <span class="text-base-content font-medium">{p.points} pts</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
