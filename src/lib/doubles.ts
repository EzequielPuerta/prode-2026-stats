import type { MatchInfo, ParsedDoubles } from './types';

export function buildDoubles(rows: string[][], matches: MatchInfo[]): ParsedDoubles {
	const byRaw = new Map(matches.map((m) => [m.raw, m.index]));
	const byPlayer: Record<string, number[]> = {};

	for (const r of rows.slice(1)) {
		const name = (r[0] ?? '').trim();
		if (!name) continue;

		const indices: number[] = [];
		for (const cell of r.slice(1)) {
			const ref = cell.trim();
			if (!ref) continue;
			const idx = byRaw.get(ref);
			if (idx === undefined) {
				throw new Error(
					`El doble "${ref}" (de ${name}) no coincide con ningún partido del CSV de predicciones.`
				);
			}
			indices.push(idx);
		}
		byPlayer[name] = indices;
	}

	return { byPlayer };
}
