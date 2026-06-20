<script lang="ts">
	let {
		value = $bindable(),
		total
	}: {
		value: number;
		total: number
	} = $props();
</script>

<fieldset
	class="fieldset bg-base-100 border-base-300 rounded-box border p-2 shadow-sm lg:flex-1 lg:p-4"
>
	<legend class="fieldset-legend">Calendario</legend>
	<div class="flex h-full flex-col justify-center gap-2 lg:gap-4">
		<input
			type="range"
			min="1"
			max={total}
			bind:value
			step="1"
			class="range range-primary w-full"
		/>
		<div class="text-base-content/60 flex justify-between px-1 text-xs">
			<span>Partido 1</span>
			<span>Partido {total}</span>
		</div>
	</div>
</fieldset>
