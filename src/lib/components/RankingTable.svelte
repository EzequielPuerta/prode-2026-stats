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

	type SortKey =
		| 'rank'
		| 'currentMatchPoints'
		| 'points'
		| 'matchPoints'
		| 'bonusPoints'
		| 'exact'
		| 'partial'
		| 'success'
		| 'errors'
		| 'notPlayed';

	const SORT_ACCESSORS: Record<SortKey, (s: Standing) => number> = {
		rank: (s) => s.rank,
		currentMatchPoints: (s) => s.currentMatchPoints,
		points: (s) => s.points,
		matchPoints: (s) => s.matchPoints,
		bonusPoints: (s) => s.bonusPoints,
		exact: (s) => s.exact,
		partial: (s) => s.partial,
		success: (s) => s.success,
		errors: (s) => s.errors,
		notPlayed: (s) => s.notPlayed
	};

	let sortKey = $state<SortKey>('rank');
	let sortDir = $state<'asc' | 'desc'>('asc');

	function toggleSort(key: SortKey) {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = key === 'rank' ? 'asc' : 'desc';
		}
	}

	function sortIndicator(key: SortKey) {
		if (sortKey !== key) return '';
		return sortDir === 'asc' ? '▲' : '▼';
	}

	const sorted = $derived.by(() => {
		const accessor = SORT_ACCESSORS[sortKey];
		const dir = sortDir === 'asc' ? 1 : -1;
		return [...standings].sort((a, b) => (accessor(a) - accessor(b)) * dir || a.rank - b.rank);
	});
</script>

<div class="overflow-x-auto">
	<table class="table-zebra table-fixed table table-xs lg:table-md">
		<thead class="bg-base-100 sticky top-0 z-10">
			<tr>
				<th class="w-10 cursor-pointer select-none" onclick={() => toggleSort('rank')}>
					# {sortIndicator('rank')}
				</th>
				<th class="w-40">Jugador</th>
				<th class="w-24">Pronóstico</th>
				<th
					class="w-24 cursor-pointer text-right select-none"
					title="Puntos obtenidos en el partido actual"
					onclick={() => toggleSort('currentMatchPoints')}
				>
					Pts. obtenidos {sortIndicator('currentMatchPoints')}
				</th>
				<th
					class="w-24 cursor-pointer text-right select-none"
					onclick={() => toggleSort('points')}
				>
					Pts. totales {sortIndicator('points')}
				</th>
				<th
					class="w-24 cursor-pointer text-right select-none"
					title="Puntos obtenidos por predicciones de partidos"
					onclick={() => toggleSort('matchPoints')}
				>
					Pts. partido {sortIndicator('matchPoints')}
				</th>
				<th
					class="w-24 cursor-pointer text-right select-none"
					title="Puntos obtenidos por predicciones bonus"
					onclick={() => toggleSort('bonusPoints')}
				>
					Pts. bonus {sortIndicator('bonusPoints')}
				</th>
				<th
					class="w-20 cursor-pointer text-right select-none"
					title="Acierto exacto del marcador (3 pts)"
					onclick={() => toggleSort('exact')}
				>
					Exactos {sortIndicator('exact')}
				</th>
				<th
					class="w-20 cursor-pointer text-right select-none"
					title="Acierto del ganador y sus goles (2 pts)"
					onclick={() => toggleSort('partial')}
				>
					Parciales {sortIndicator('partial')}
				</th>
				<th
					class="w-20 cursor-pointer text-right select-none"
					title="Acierto de ganador o empate (1 pt)"
					onclick={() => toggleSort('success')}
				>
					Aciertos {sortIndicator('success')}
				</th>
				<th
					class="w-20 cursor-pointer text-right select-none"
					title="Pronósticos sin acertar"
					onclick={() => toggleSort('errors')}
				>
					Errores {sortIndicator('errors')}
				</th>
				<th
					class="w-20 cursor-pointer text-right select-none"
					title="Partidos que no pronosticó"
					onclick={() => toggleSort('notPlayed')}
				>
					Sin jugar {sortIndicator('notPlayed')}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each sorted as s (s.name)}
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
							<div class="badge badge-neutral">
								#-#
							</div>
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
					<td class="text-right text-base-content/50 tabular-nums">{s.matchPoints}</td>
					<td class="text-right text-base-content/50 tabular-nums {s.loadedBonus ? '' : 'text-base-content/50'}">
						{s.bonusPoints}
					</td>
					<td class="text-success text-right tabular-nums">{s.exact}</td>
					<td class="text-warning text-right tabular-nums">{s.partial}</td>
					<td class="text-info text-right tabular-nums">{s.success}</td>
					<td class="text-error text-right tabular-nums">{s.errors}</td>
					<td class="text-base-content/50 text-right tabular-nums">{s.notPlayed}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
