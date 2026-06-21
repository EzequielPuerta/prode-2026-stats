export function coefficientOfVariation(values: number[]): number {
	if (values.length === 0) return 0;
	const mean = values.reduce((a, b) => a + b, 0) / values.length;
	if (mean === 0) return 0;
	const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
	return Math.sqrt(variance) / mean;
}

export function giniCoefficient(values: number[]): number {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const n = sorted.length;
	const sum = sorted.reduce((a, b) => a + b, 0);
	if (sum === 0) return 0;
	const weightedSum = sorted.reduce((acc, value, i) => acc + (i + 1) * value, 0);
	return (2 * weightedSum) / (n * sum) - (n + 1) / n;
}
