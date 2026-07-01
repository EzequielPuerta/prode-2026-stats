export interface Score {
	home: number;
	away: number;
}

export interface MatchInfo {
	index: number;
	home: string;
	away: string;
	date: string;
	raw: string;
	result: Score | null;
}

export interface PlayerRow {
	name: string;
	sitePoints: number;
	bonusPoints: number;
	loadedBonus: boolean;
	predictions: (Score | null)[];
}

export interface ParsedProde {
	matches: MatchInfo[];
	players: PlayerRow[];
}

export interface ParsedDoubles {
	byPlayer: Record<string, number[]>;
}

export interface MatchPrediction {
	score: Score | null;
	category: Outcome | null;
}

export interface Standing {
	rank: number;
	name: string;
	points: number;
	matchPoints: number;
	bonusPoints: number;
	loadedBonus: boolean;
	exact: number;
	partial: number;
	success: number;
	errors: number;
	notPlayed: number;
	prediction: MatchPrediction;
	currentMatchPoints: number;
	previousRank: number;
}

// --- Rules ---
export type RuleId = 'Success' | 'PartialSuccess' | 'ExactSuccess';

export interface Rule {
	id: RuleId;
	label: string;
	points: number;
	locked: boolean;
}

export const RULES: Record<RuleId, Rule> = {
	Success: {
		id: 'Success',
		label: 'Acierto',
		points: 1,
		locked: true
	},
	PartialSuccess: {
		id: 'PartialSuccess',
		label: 'Parcial',
		points: 2,
		locked: false
	},
	ExactSuccess: {
		id: 'ExactSuccess',
		label: 'Exacto',
		points: 3,
		locked: false
	}
};

export interface ScoringConfig {
	partialSuccess: boolean;
	exactSuccess: boolean;
	doubles: boolean;
}

export const ALL_SITE_RULES_ACTIVE: ScoringConfig = {
	partialSuccess: false,
	exactSuccess: true,
	doubles: true
};

export interface SiteMismatch {
	name: string;
	expected: number;
	got: number;
}

// --- Outcome ---
export type Outcome = 'exact' | 'partial' | 'success' | 'miss';

export interface ScoredPrediction {
	category: Outcome;
	points: number;
}

// --- Scenario ---
export interface Scenario {
	label: string;
	config: ScoringConfig;
}

export interface RankingDiff {
	name: string;
	baseRank: number;
	targetRank: number;
	diff: number;
}

export interface ComparisonRow extends RankingDiff {
	points: number;
}
