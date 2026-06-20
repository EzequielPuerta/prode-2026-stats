import type { Score, MatchInfo, PlayerRow, ParsedProde } from './types';

const NAME_REAL_RESULT = '(Resultado real)';

export function parseScore(raw: string): Score | null {
	const s = raw.trim();
	if (!s) return null;
	const parts = s.split(/[–—-]/).map((p) => p.trim());
	if (parts.length !== 2) return null;
	const home = Number(parts[0]);
	const away = Number(parts[1]);
	if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
	return { home, away };
}

function parseMatchHeader(raw: string, index: number): MatchInfo {
	const trimmed = raw.trim();
	const m = trimmed.match(/^(.*?)\s+vs\s+(.*?)\s*\((\d{1,2}\/\d{1,2})\)\s*$/i);
	if (m) {
		return { index, home: m[1].trim(), away: m[2].trim(), date: m[3], raw: trimmed, result: null };
	}
	return { index, home: trimmed, away: '', date: '', raw: trimmed, result: null };
}

export function buildParsed(rows: string[][]): ParsedProde {
	if (rows.length === 0) {
		throw new Error('El CSV está vacío.');
	}
	const header = rows[0];
	if (header.length < 4) {
		throw new Error('El CSV no tiene el formato esperado (faltan columnas de partidos).');
	}

	const matches: MatchInfo[] = header.slice(3).map((h, i) => parseMatchHeader(h, i));
	const players: PlayerRow[] = [];

	for (const r of rows.slice(1)) {
		const name = (r[1] ?? '').trim();
		if (!name) continue;

		const predictions = matches.map((mt) => parseScore(r[3 + mt.index] ?? ''));

		if (name === NAME_REAL_RESULT) {
			matches.forEach((mt, i) => {
				mt.result = predictions[i];
			});
			continue;
		}

		players.push({
			name,
			sitePoints: Number((r[2] ?? '').trim()) || 0,
			predictions
		});
	}

	return { matches, players };
}

export function playedMatchIndices(parsed: ParsedProde): number[] {
	return parsed.matches.filter((m) => m.result !== null).map((m) => m.index);
}
