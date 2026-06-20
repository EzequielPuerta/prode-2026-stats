<script lang="ts">
	import type { Outcome, Standing } from '$lib/types';

	let { standings }: { standings: Standing[] } = $props();

	const BADGE_CLASS: Record<Outcome, string> = {
		exact: 'badge-success',
		partial: 'badge-warning',
		success: 'badge-info',
		miss: 'badge-error'
	};

	const TEXT_CLASS: Record<Outcome, string> = {
		exact: 'text-success',
		partial: 'text-warning',
		success: 'text-info',
		miss: 'text-error'
	};
</script>

<table class="table-zebra table-fixed table table-xs lg:table-md">
	<thead class="bg-base-100 sticky top-0 z-10">
		<tr>
			<th class="w-10">#</th>
			<th class="w-40">Jugador</th>
			<th class="w-24">Pronóstico</th>
			<th class="w-24 text-right" title="Puntos obtenidos en el partido actual">Pts. obtenidos</th>
			<th class="w-24 text-right">Pts. totales</th>
			<th class="w-20 text-right" title="Acierto exacto del marcador (3 pts)">Exactos</th>
			<th class="w-20 text-right" title="Acierto del ganador y sus goles (2 pts)">Parciales</th>
			<th class="w-20 text-right" title="Acierto de ganador o empate (1 pt)">Aciertos</th>
			<th class="w-20 text-right" title="Pronósticos sin acertar">Errores</th>
			<th class="w-20 text-right" title="Partidos que no pronosticó">Sin jugar</th>
		</tr>
	</thead>
	<tbody>
		{#each standings as s (s.name)}
			{@const pred = s.prediction}
			{@const rankDiff = s.previousRank - s.rank}
			<tr>
				<td class="font-semibold tabular-nums">{s.rank}º</td>
				<td class="truncate">
					{s.name}
					{#if rankDiff > 0}
						<span class="text-success text-xs font-semibold">▲{rankDiff}</span>
					{:else if rankDiff < 0}
						<span class="text-error text-xs font-semibold">▼{-rankDiff}</span>
					{/if}
				</td>
				<td>
					{#if pred.score}
						<div class="badge {pred.category ? BADGE_CLASS[pred.category] : 'badge-ghost'}">
							{pred.score.home}-{pred.score.away}
						</div>
					{:else}
						<span class="text-base-content/50 text-xs">Sin pronóstico</span>
					{/if}
				</td>
				<td
					class="text-right tabular-nums {pred.category
						? TEXT_CLASS[pred.category]
						: 'text-base-content/50'}"
				>
					{s.currentMatchPoints}
				</td>
				<td class="text-right font-bold tabular-nums">{s.points}</td>
				<td class="text-success text-right tabular-nums">{s.exact}</td>
				<td class="text-warning text-right tabular-nums">{s.partial}</td>
				<td class="text-info text-right tabular-nums">{s.success}</td>
				<td class="text-error text-right tabular-nums">{s.errors}</td>
				<td class="text-base-content/50 text-right tabular-nums">{s.notPlayed}</td>
			</tr>
		{/each}
	</tbody>
</table>
