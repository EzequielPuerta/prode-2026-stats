<script lang="ts">
	import { parseCsv } from '$lib/csv';
	import { buildParsed, playedMatchIndices } from '$lib/predictions';
	import { buildDoubles } from '$lib/doubles';
	import { computeStandings } from '$lib/scoring';
	import { validateAgainstSite } from '$lib/validation';
	import MatchCard from '$lib/components/MatchCard.svelte';
	import CalendarSlider from '$lib/components/CalendarSlider.svelte';
	import RulesToggles from '$lib/components/RulesToggles.svelte';
	import RankingTable from '$lib/components/RankingTable.svelte';
	import RankingStats from '$lib/components/RankingStats.svelte';
	import RankingComparison from '$lib/components/RankingComparison.svelte';
	import pronosticosCsv from '$lib/data/pronosticos.csv?raw';
	import doblesCsv from '$lib/data/dobles.csv?raw';
	import type {
		ParsedProde,
		ParsedDoubles,
		ScoringConfig,
		Scenario,
		SiteMismatch
	} from '$lib/types';

	let parsed = $state<ParsedProde | null>(null);
	let doubles = $state<ParsedDoubles | null>(null);
	let error = $state<string | null>(null);
	let mismatches = $state<SiteMismatch[]>([]);
	let throughCount = $state(0);

	let partialSuccess = $state(false);
	let exactSuccess = $state(true);
	let doublesEnabled = $state(true);

	let tab = $state<'ranking' | 'diff'>('ranking');
	let hoveredPlayer = $state<string | null>(null);

	try {
		const data = buildParsed(parseCsv(pronosticosCsv));
		const dbl = buildDoubles(parseCsv(doblesCsv), data.matches);
		parsed = data;
		doubles = dbl;
		throughCount = playedMatchIndices(data).length;
		mismatches = validateAgainstSite(data, dbl);
	} catch (err) {
		error = err instanceof Error ? err.message : 'No se pudieron procesar los CSV.';
	}

	const config = $derived<ScoringConfig>({
		partialSuccess,
		exactSuccess,
		doubles: doublesEnabled && !!doubles
	});

	const baseScenario: Scenario = {
		label: 'Solo acierto',
		config: { partialSuccess: false, exactSuccess: false, doubles: false }
	};
	const targetScenario: Scenario = {
		label: 'Exactos + dobles',
		config: { partialSuccess: false, exactSuccess: true, doubles: true }
	};
	const liveTargetScenario = $derived<Scenario>({
		label: [
			'Acierto',
			config.partialSuccess && 'parcial',
			config.exactSuccess && 'exacto',
			config.doubles && 'dobles'
		]
			.filter(Boolean)
			.join(' + '),
		config
	});

	const played = $derived(parsed ? playedMatchIndices(parsed) : []);
	const standings = $derived(parsed ? computeStandings(parsed, doubles, throughCount, config) : []);
	const currentMatch = $derived(
		parsed && throughCount > 0 ? parsed.matches[played[throughCount - 1]] : null
	);
</script>

<div class="mx-auto flex h-dvh max-w-full flex-col gap-3 px-4 py-3 md:max-w-[98%] lg:gap-6 lg:py-6">
	<header class="shrink-0 space-y-1">
		<h1 class="text-xl md:text-3xl font-bold">⚽ Prode Stats</h1>
	</header>

	{#if error}
		<div role="alert" class="alert alert-error shrink-0">
			<span>{error}</span>
		</div>
	{/if}

	{#if mismatches.length > 0}
		<div role="alert" class="alert alert-warning shrink-0">
			<span>
				El puntaje calculado no coincide con el de la web para {mismatches.length}
				jugador{mismatches.length === 1 ? '' : 'es'}:
				{mismatches.map((m) => `${m.name} (web ${m.expected} ≠ calc ${m.got})`).join(', ')}.
			</span>
		</div>
	{/if}

	{#if parsed && played.length > 0}
		<div class="flex shrink-0 flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-4">
			<CalendarSlider bind:value={throughCount} total={played.length} />

			{#if currentMatch}
				<MatchCard match={currentMatch} index={throughCount} total={played.length} />
			{/if}

			<RulesToggles
				bind:partialSuccess
				bind:exactSuccess
				bind:doublesEnabled
				doublesAvailable={!!doubles}
			/>
		</div>

		<div role="tablist" class="tabs tabs-lift shrink-0">
			<button
				role="tab"
				class="tab"
				class:tab-active={tab === 'ranking'}
				onclick={() => (tab = 'ranking')}
			>
				Ranking
			</button>
			<button
				role="tab"
				class="tab"
				class:tab-active={tab === 'diff'}
				onclick={() => (tab = 'diff')}
			>
				Diferencias
			</button>
		</div>

		<section class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
			{#if tab === 'ranking'}
				<div class="flex flex-col gap-4">
					<RankingStats {standings} />
					<RankingTable {standings} />
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 lg:h-full lg:grid-cols-2">
					<div class="flex min-h-0 flex-col gap-2">
						<h2 class="shrink-0 text-lg font-semibold">Sólo acierto vs. Exactos + dobles</h2>
						<RankingComparison
							parsed={parsed!}
							{doubles}
							{throughCount}
							base={baseScenario}
							target={targetScenario}
							bind:hoveredPlayer
						/>
					</div>

					<div class="flex min-h-0 flex-col gap-2">
						<h2 class="shrink-0 text-lg font-semibold">Sólo acierto vs. Reglas configuradas</h2>
						<RankingComparison
							parsed={parsed!}
							{doubles}
							{throughCount}
							base={baseScenario}
							target={liveTargetScenario}
							bind:hoveredPlayer
						/>
					</div>
				</div>
			{/if}
		</section>
	{/if}
</div>
