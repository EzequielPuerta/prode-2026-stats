import { RULES } from './types';
import type {
	Score,
	Outcome,
	ParsedProde,
	ParsedDoubles,
	Standing,
	ScoredPrediction,
	ScoringConfig,
	RankingDiff
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
	} else if (outcome === 'partial' && config.partialSuccess) {
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

export function computeStandings(
	parsed: ParsedProde,
	doubles: ParsedDoubles | null,
	throughCount: number,
	config: ScoringConfig
): Standing[] {
	const played = playedMatchIndices(parsed);
	const included = played.slice(0, Math.max(0, throughCount));

	const rows = parsed.players.map((p) => {
		const doubledSet = new Set(doubles?.byPlayer[p.name] ?? []);
		let points = 0;
		let exact = 0;
		let partial = 0;
		let success = 0;
		let errors = 0;
		let notPlayed = 0;

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
		}

		return { name: p.name, points, exact, partial, success, errors, notPlayed };
	});

	rows.sort(
		(a, b) =>
			b.points - a.points ||
			b.exact - a.exact ||
			(config.partialSuccess ? b.partial - a.partial : 0) ||
			b.success - a.success ||
			a.errors - b.errors ||
			a.name.localeCompare(b.name)
	);

	const sameRank = (a: (typeof rows)[number], b: (typeof rows)[number]) =>
		a.points === b.points &&
		a.exact === b.exact &&
		(!config.partialSuccess || a.partial === b.partial) &&
		a.success === b.success &&
		a.errors === b.errors;

	const standings: Standing[] = [];
	for (let i = 0; i < rows.length; i++) {
		const rank = i > 0 && sameRank(rows[i], rows[i - 1]) ? standings[i - 1].rank : i + 1;
		standings.push({ rank, ...rows[i] });
	}
	return standings;
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
