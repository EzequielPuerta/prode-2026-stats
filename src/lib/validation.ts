import { ALL_SITE_RULES_ACTIVE } from './types';
import type { ParsedProde, ParsedDoubles, SiteMismatch } from './types';
import { playedMatchIndices } from './predictions';
import { scorePrediction } from './scoring';

export function validateAgainstSite(
	parsed: ParsedProde,
	doubles: ParsedDoubles | null
): SiteMismatch[] {
	const played = playedMatchIndices(parsed);
	const mismatches: SiteMismatch[] = [];

	for (const p of parsed.players) {
		const doubledSet = new Set(doubles?.byPlayer[p.name] ?? []);
		let got = 0;
		for (const idx of played) {
			const pred = p.predictions[idx];
			const result = parsed.matches[idx].result;
			if (!result || !pred) continue;
			got += scorePrediction(pred, result, ALL_SITE_RULES_ACTIVE, doubledSet.has(idx)).points;
		}
		if (got !== p.sitePoints) {
			mismatches.push({ name: p.name, expected: p.sitePoints, got });
		}
	}

	return mismatches;
}
