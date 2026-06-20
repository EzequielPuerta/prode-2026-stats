<script lang="ts">
	import 'flag-icons/css/flag-icons.min.css';
	import { countryCode } from '$lib/countries';
	import type { MatchInfo } from '$lib/types';

	let {
		match,
		index,
		total
	}: {
		match: MatchInfo;
		index: number;
		total: number
	} = $props();

	const homeCode = $derived(countryCode(match.home));
	const awayCode = $derived(countryCode(match.away));
</script>

{#snippet flag(code: string | null, name: string)}
	{#if code}
		<span class="fi fi-{code} rounded-sm text-xl shadow-sm lg:text-3xl" title={name}></span>
	{:else}
		<span
			class="bg-base-300 text-base-content/60 flex h-4 w-6 items-center justify-center rounded-sm text-[8px] font-semibold lg:h-6 lg:w-9 lg:text-[10px]"
			title={name}
		>
			{name.slice(0, 3).toUpperCase()}
		</span>
	{/if}
{/snippet}

<fieldset
	class="fieldset bg-base-100 border-base-300 rounded-box flex min-w-0 flex-1 items-center justify-center border p-2 shadow-sm lg:p-4"
>
	<legend class="fieldset-legend">Partido {index} de {total}</legend>
	<div class="flex w-full items-center justify-center gap-2 text-sm lg:gap-5 lg:text-base">
		<div
			class="flex min-w-0 flex-1 flex-col items-stretch gap-1 text-center lg:flex-row lg:items-center lg:justify-end lg:gap-2 lg:text-right"
		>
			<span class="truncate font-medium">{match.home}</span>
			<span class="self-center">{@render flag(homeCode, match.home)}</span>
		</div>

		<div class="flex flex-col items-center">
			{#if match.result}
				<div class="text-lg font-bold tabular-nums lg:text-2xl">
					{match.result.home}–{match.result.away}
				</div>
			{:else}
				<div class="text-base-content/50 font-semibold lg:text-lg">vs</div>
			{/if}
			{#if match.date}
				<div class="text-base-content/50 text-xs">{match.date}</div>
			{/if}
		</div>

		<div
			class="flex min-w-0 flex-1 flex-col items-stretch gap-1 text-center lg:flex-row lg:items-center lg:gap-2 lg:text-left"
		>
			<span class="order-1 truncate font-medium lg:order-2">{match.away}</span>
			<span class="order-2 self-center lg:order-1">{@render flag(awayCode, match.away)}</span>
		</div>
	</div>
</fieldset>
