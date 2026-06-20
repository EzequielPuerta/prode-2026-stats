<script lang="ts">
	import type { Standing } from '$lib/types';

	let { standings }: { standings: Standing[] } = $props();
</script>

<table class="table-zebra table table-xs lg:table-md">
	<thead class="bg-base-100 sticky top-0 z-10">
		<tr>
			<th>#</th>
			<th>Jugador</th>
			<th class="text-right">Puntos</th>
			<th class="text-right" title="Acierto exacto del marcador (3 pts)">Exactos</th>
			<th class="text-right" title="Acierto del ganador y sus goles (2 pts)">Parciales</th>
			<th class="text-right" title="Acierto de ganador o empate (1 pt)">Aciertos</th>
			<th class="text-right" title="Pronósticos sin acertar">Errores</th>
			<th class="text-right" title="Partidos que no pronosticó">Sin jugar</th>
		</tr>
	</thead>
	<tbody>
		{#each standings as s (s.name)}
			<tr>
				<td class="font-semibold tabular-nums">{s.rank}º</td>
				<td>{s.name}</td>
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
