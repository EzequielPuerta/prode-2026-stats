<script lang="ts">
	import type { Standing } from '$lib/types';

	let { standings }: { standings: Standing[] } = $props();

	const stats = $derived.by(() => {
		if (standings.length === 0) return null;

		const leaders = standings.filter((s) => s.rank === 1);
		const counts = standings.reduce(
			(acc, s) => {
				const category = s.prediction.category;
				if (category === 'exact') acc.exact++;
				else if (category === 'partial') acc.partial++;
				else if (category === 'success') acc.success++;
				else if (category === 'miss') acc.miss++;
				else acc.notPlayed++;
				return acc;
			},
			{ exact: 0, partial: 0, success: 0, miss: 0, notPlayed: 0 }
		);

		const riser = standings.reduce(
			(best, s) =>
				s.previousRank - s.rank > (best?.diff ?? 0) ? { s, diff: s.previousRank - s.rank } : best,
			null as { s: Standing; diff: number } | null
		);
		const faller = standings.reduce(
			(worst, s) =>
				s.rank - s.previousRank > (worst?.diff ?? 0) ? { s, diff: s.rank - s.previousRank } : worst,
			null as { s: Standing; diff: number } | null
		);

		return { leaders, counts, riser, faller };
	});
</script>

{#if stats}
	<div class="stats stats-horizontal w-full shrink-0 overflow-x-auto shadow">
		<div class="stat w-48 px-4 py-3 lg:w-80 lg:px-6 lg:py-4">
			<div class="stat-title truncate text-xs lg:text-sm">Líder</div>
			<div class="stat-value max-w-[16ch] truncate text-lg lg:text-2xl">
				{stats.leaders.map((l) => l.name).join(' / ')}
			</div>
			<div class="stat-desc truncate">{stats.leaders[0].points} puntos</div>
		</div>
		<div class="stat w-28 px-4 py-3 lg:w-40 lg:px-6 lg:py-4">
			<div class="stat-title truncate text-xs lg:text-sm">Exactos</div>
			<div class="stat-value text-success text-lg lg:text-2xl">{stats.counts.exact}</div>
			<div class="stat-desc truncate">partido actual</div>
		</div>
		<div class="stat w-28 px-4 py-3 lg:w-40 lg:px-6 lg:py-4">
			<div class="stat-title truncate text-xs lg:text-sm">Parciales</div>
			<div class="stat-value text-warning text-lg lg:text-2xl">{stats.counts.partial}</div>
			<div class="stat-desc truncate">partido actual</div>
		</div>
		<div class="stat w-28 px-4 py-3 lg:w-40 lg:px-6 lg:py-4">
			<div class="stat-title truncate text-xs lg:text-sm">Aciertos</div>
			<div class="stat-value text-info text-lg lg:text-2xl">{stats.counts.success}</div>
			<div class="stat-desc truncate">partido actual</div>
		</div>
		<div class="stat w-28 px-4 py-3 lg:w-40 lg:px-6 lg:py-4">
			<div class="stat-title truncate text-xs lg:text-sm">Errores</div>
			<div class="stat-value text-error text-lg lg:text-2xl">{stats.counts.miss}</div>
			<div class="stat-desc truncate">partido actual</div>
		</div>
		<div class="stat w-28 px-4 py-3 lg:w-40 lg:px-6 lg:py-4">
			<div class="stat-title truncate text-xs lg:text-sm">Sin jugar</div>
			<div class="stat-value text-base-content/50 text-lg lg:text-2xl">{stats.counts.notPlayed}</div>
			<div class="stat-desc truncate">partido actual</div>
		</div>
		<div class="stat w-28 px-4 py-3 lg:w-40 lg:px-6 lg:py-4">
			<div class="stat-title truncate text-xs lg:text-sm">Mayor subida</div>
			<div class="stat-value text-success text-lg lg:text-2xl">
				{stats.riser ? `▲${stats.riser.diff}` : '—'}
			</div>
			<div class="stat-desc max-w-[12ch] truncate">{stats.riser?.s.name ?? 'Sin cambios'}</div>
		</div>
		<div class="stat w-28 px-4 py-3 lg:w-40 lg:px-6 lg:py-4">
			<div class="stat-title truncate text-xs lg:text-sm">Mayor caída</div>
			<div class="stat-value text-error text-lg lg:text-2xl">
				{stats.faller ? `▼${stats.faller.diff}` : '—'}
			</div>
			<div class="stat-desc max-w-[12ch] truncate">{stats.faller?.s.name ?? 'Sin cambios'}</div>
		</div>
	</div>
{/if}
