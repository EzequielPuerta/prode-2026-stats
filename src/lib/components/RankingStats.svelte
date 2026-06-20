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
	<div class="stats stats-vertical sm:stats-horizontal w-full shrink-0 overflow-x-auto shadow">
		<div class="stat w-80">
			<div class="stat-title">Líder</div>
			<div class="stat-value max-w-[16ch] truncate text-2xl">
				{stats.leaders.map((l) => l.name).join(' / ')}
			</div>
			<div class="stat-desc">{stats.leaders[0].points} puntos</div>
		</div>
		<div class="stat w-40">
			<div class="stat-title">Pronósticos exactos</div>
			<div class="stat-value text-success text-2xl">{stats.counts.exact}</div>
			<div class="stat-desc">partido actual</div>
		</div>
		<div class="stat w-40">
			<div class="stat-title">Pronósticos parciales</div>
			<div class="stat-value text-warning text-2xl">{stats.counts.partial}</div>
			<div class="stat-desc">partido actual</div>
		</div>
		<div class="stat w-40">
			<div class="stat-title">Pronósticos acertados</div>
			<div class="stat-value text-info text-2xl">{stats.counts.success}</div>
			<div class="stat-desc">partido actual</div>
		</div>
		<div class="stat w-40">
			<div class="stat-title">Pronósticos errados</div>
			<div class="stat-value text-error text-2xl">{stats.counts.miss}</div>
			<div class="stat-desc">partido actual</div>
		</div>
		<div class="stat w-40">
			<div class="stat-title">Sin jugar</div>
			<div class="stat-value text-base-content/50 text-2xl">{stats.counts.notPlayed}</div>
			<div class="stat-desc">partido actual</div>
		</div>
		<div class="stat w-40">
			<div class="stat-title">Mayor subida</div>
			<div class="stat-value text-success text-2xl">
				{stats.riser ? `▲${stats.riser.diff}` : '—'}
			</div>
			<div class="stat-desc max-w-[12ch] truncate">{stats.riser?.s.name ?? 'Sin cambios'}</div>
		</div>
		<div class="stat w-40">
			<div class="stat-title">Mayor caída</div>
			<div class="stat-value text-error text-2xl">
				{stats.faller ? `▼${stats.faller.diff}` : '—'}
			</div>
			<div class="stat-desc max-w-[12ch] truncate">{stats.faller?.s.name ?? 'Sin cambios'}</div>
		</div>
	</div>
{/if}
