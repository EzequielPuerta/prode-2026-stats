<script lang="ts">
	import { Plot, BarY } from 'svelteplot';
	import PlotProbe from '../PlotProbe.svelte';
	import type { ComparisonRow } from '$lib/types';

	let {
		rows,
		orderedNames,
		height,
		targetLabel,
		hoveredPlayer = $bindable(null),
		histogramMode = $bindable(false)
	}: {
		rows: ComparisonRow[];
		orderedNames: string[];
		height: number;
		targetLabel: string;
		hoveredPlayer?: string | null;
		histogramMode?: boolean;
	} = $props();

	function shortName(name: string): string {
		const parts = name.trim().split(/\s+/);
		if (parts.length === 1) return parts[0];
		return `${parts[0]} ${parts[parts.length - 1][0]}.`;
	}

	let sorted = $state(false);
	const order = $derived(
		sorted ? [...rows].sort((a, b) => b.points - a.points).map((r) => r.name) : orderedNames
	);

	const maxPoints = $derived(rows.length ? Math.max(...rows.map((r) => r.points)) : 0);
	const hoverYDomain = $derived([0, maxPoints * 1.1 || 1]);

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
		const y = scales.y.fn(row.points);
		return { row, x, y };
	});
</script>

<div class="absolute top-2 right-2 z-30 flex items-center gap-2">
	<label
		class="bg-base-100/80 border-base-300 rounded-box flex items-center gap-1.5 border px-2 py-1 shadow"
		title="Ordenar por puntos"
	>
		<svg viewBox="0 0 20 20" fill="currentColor" class="text-base-content/70 size-4">
			<path
				fill-rule="evenodd"
				d="M2.24 6.8a.75.75 0 0 0 1.06-.04l1.95-2.1v8.59a.75.75 0 0 0 1.5 0V4.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0l-3.25 3.5a.75.75 0 0 0 .04 1.06Zm6.5 8.96a.75.75 0 0 0-.04 1.06l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V8.66a.75.75 0 0 0-1.5 0v8.59l-1.95-2.1a.75.75 0 0 0-1.06-.04Z"
				clip-rule="evenodd"
			/>
		</svg>
		<input type="checkbox" class="toggle toggle-xs" bind:checked={sorted} />
	</label>
	<label
		class="bg-base-100/80 border-base-300 rounded-box flex items-center gap-1.5 border px-2 py-1 shadow"
		title="Histograma real"
	>
		<svg viewBox="0 0 20 20" fill="currentColor" class="text-base-content/70 size-4">
			<path
				d="M2 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-6ZM8 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7ZM14 3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V3Z"
			/>
		</svg>
		<input type="checkbox" class="toggle toggle-xs" bind:checked={histogramMode} />
	</label>
</div>

<Plot
	{height}
	marginBottom={92}
	marginLeft={40}
	x={{
		domain: order,
		tickFormat: (d: unknown) => shortName(String(d)),
		tickRotate: -90,
		label: false
	}}
	y={{ label: 'Puntos', grid: true, domain: [0, 45] }}
>
	<PlotProbe onscales={(s) => (scales = s as Scales)} />
	<BarY
		data={rows}
		x="name"
		y="points"
		fill={(d: ComparisonRow) => (d.name === hoveredPlayer ? 'white' : 'var(--color-primary)')}
	/>
	<!-- Barras transparentes de alto completo: zona de hover para el tooltip. -->
	<BarY
		data={rows}
		x="name"
		y1={() => hoverYDomain[0]}
		y2={() => hoverYDomain[1]}
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
			{targetLabel}:
			<span class="text-base-content font-medium">{tooltip.row.points} pts</span>
		</div>
		<div class="text-base-content/70">
			Posición: <span class="text-base-content font-medium">{tooltip.row.targetRank}º</span>
		</div>
	</div>
{/if}
