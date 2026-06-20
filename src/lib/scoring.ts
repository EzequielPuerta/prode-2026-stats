import { RULES } from './types';
import type {
	Score,
	Outcome,
	ParsedProde,
	ParsedDoubles,
	Standing,
	ScoredPrediction,
	ScoringConfig,
	RankingDiff,
	MatchPrediction
} from './types';
import { playedMatchIndices } from './predictions';

function evaluatePrediction(pred: Score, result: Score): Outcome {
	if (pred.home === result.home && pred.away === result.away) return 'exact';

	const predSign = Math.sign(pred.home - pred.away);
	const realSign = Math.sign(result.home - result.away);
	if (predSign !== realSign) return 'miss';

	if (realSign !== 0) {
		const winnerGoalsOk = realSign > 0 ? pred.home === result.home : pred.away === result.away;
		if (winnerGoalsOk) return 'partial';
	}
	return 'success';
}

export function scorePrediction(
	pred: Score,
	result: Score,
	config: ScoringConfig,
	doubled: boolean
): ScoredPrediction {
	const outcome = evaluatePrediction(pred, result);

	let category: Outcome;
	let base: number;
	if (outcome === 'exact' && config.exactSuccess) {
		category = 'exact';
		base = RULES.ExactSuccess.points;
	} else if ((outcome === 'exact' || outcome === 'partial') && config.partialSuccess) {
		category = 'partial';
		base = RULES.PartialSuccess.points;
	} else if (outcome === 'exact' || outcome === 'partial' || outcome === 'success') {
		category = 'success';
		base = RULES.Success.points;
	} else {
		category = 'miss';
		base = 0;
	}

	const points = config.doubles && doubled ? base * 2 : base;
	return { category, points };
}

interface AggregatedRow {
	name: string;
	points: number;
	exact: number;
	partial: number;
	success: number;
	errors: number;
	notPlayed: number;
	prediction: MatchPrediction;
	currentMatchPoints: number;
}

function aggregateRows(
	parsed: ParsedProde,
	doubles: ParsedDoubles | null,
	included: number[],
	config: ScoringConfig
): AggregatedRow[] {
	const currentIndex = included.length > 0 ? included[included.length - 1] : null;

	return parsed.players.map((p) => {
		const doubledSet = new Set(doubles?.byPlayer[p.name] ?? []);
		let points = 0;
		let exact = 0;
		let partial = 0;
		let success = 0;
		let errors = 0;
		let notPlayed = 0;
		let prediction: MatchPrediction = { score: null, category: null };
		let currentMatchPoints = 0;

		for (const idx of included) {
			const pred = p.predictions[idx];
			const result = parsed.matches[idx].result;
			if (!result) continue;
			if (!pred) {
				notPlayed++;
				continue;
			}
			const scored = scorePrediction(pred, result, config, doubledSet.has(idx));
			points += scored.points;
			if (scored.category === 'exact') exact++;
			else if (scored.category === 'partial') partial++;
			else if (scored.category === 'success') success++;
			else errors++;

			if (idx === currentIndex) {
				prediction = { score: pred, category: scored.category };
				currentMatchPoints = scored.points;
			}
		}

		return {
			name: p.name,
			points,
			exact,
			partial,
			success,
			errors,
			notPlayed,
			prediction,
			currentMatchPoints
		};
	});
}

function rankRows(
	rows: AggregatedRow[],
	config: ScoringConfig
): (AggregatedRow & { rank: number })[] {
	const sorted = [...rows].sort(
		(a, b) =>
			b.points - a.points ||
			b.exact - a.exact ||
			(config.partialSuccess ? b.partial - a.partial : 0) ||
			b.success - a.success ||
			a.errors - b.errors ||
			a.name.localeCompare(b.name)
	);

	const sameRank = (a: AggregatedRow, b: AggregatedRow) =>
		a.points === b.points &&
		a.exact === b.exact &&
		(!config.partialSuccess || a.partial === b.partial) &&
		a.success === b.success &&
		a.errors === b.errors;

	const ranked: (AggregatedRow & { rank: number })[] = [];
	for (let i = 0; i < sorted.length; i++) {
		const rank = i > 0 && sameRank(sorted[i], sorted[i - 1]) ? ranked[i - 1].rank : i + 1;
		ranked.push({ rank, ...sorted[i] });
	}
	return ranked;
}

export function computeStandings(
	parsed: ParsedProde,
	doubles: ParsedDoubles | null,
	throughCount: number,
	config: ScoringConfig
): Standing[] {
	const played = playedMatchIndices(parsed);
	const included = played.slice(0, Math.max(0, throughCount));

	const ranked = rankRows(aggregateRows(parsed, doubles, included, config), config);

	const previousRanked = rankRows(
		aggregateRows(parsed, doubles, included.slice(0, -1), config),
		config
	);
	const previousRankByName = new Map(previousRanked.map((r) => [r.name, r.rank]));

	return ranked.map((r) => ({
		...r,
		previousRank: previousRankByName.get(r.name) ?? r.rank
	}));
}

export function rankingDifferences(
	parsed: ParsedProde,
	doubles: ParsedDoubles | null,
	throughCount: number,
	baseConfig: ScoringConfig,
	targetConfig: ScoringConfig
): RankingDiff[] {
	const baseStandings = computeStandings(parsed, doubles, throughCount, baseConfig);
	const targetStandings = computeStandings(parsed, doubles, throughCount, targetConfig);
	const targetRank = new Map(targetStandings.map((s) => [s.name, s.rank]));

	return [...baseStandings]
		.sort((a, b) => a.rank - b.rank)
		.map((s) => {
			const tr = targetRank.get(s.name) ?? s.rank;
			return { name: s.name, baseRank: s.rank, targetRank: tr, diff: s.rank - tr };
		});
}
