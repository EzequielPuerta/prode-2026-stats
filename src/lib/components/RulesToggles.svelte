<script lang="ts">
	let {
		partialSuccess = $bindable(),
		exactSuccess = $bindable(),
		doublesEnabled = $bindable(),
		doublesAvailable
	}: {
		partialSuccess: boolean;
		exactSuccess: boolean;
		doublesEnabled: boolean;
		doublesAvailable: boolean;
	} = $props();
</script>

<fieldset
	class="fieldset bg-base-100 border-base-300 rounded-box border p-2 shadow-sm lg:flex-1 lg:p-4"
>
	<legend class="fieldset-legend">Reglas</legend>
	<div class="grid grid-cols-2 gap-x-4 gap-y-0 text-xs lg:grid-cols-4 lg:gap-y-1 lg:text-sm">
		<label class="label">
			<input type="checkbox" class="toggle toggle-sm lg:toggle-md" checked disabled />
			Acierto <span class="text-base-content/50">(1 pt)</span>
		</label>
		<label class="label">
			<input type="checkbox" class="toggle toggle-sm lg:toggle-md" bind:checked={partialSuccess} />
			Parcial <span class="text-base-content/50">(2 pts)</span>
		</label>
		<label class="label">
			<input type="checkbox" class="toggle toggle-sm lg:toggle-md" bind:checked={exactSuccess} />
			Exacto <span class="text-base-content/50">(3 pts)</span>
		</label>
		<label class="label" class:opacity-50={!doublesAvailable}>
			<input
				type="checkbox"
				class="toggle toggle-sm lg:toggle-md"
				bind:checked={doublesEnabled}
				disabled={!doublesAvailable}
			/>
			Dobles <span class="text-base-content/50">(×2)</span>
		</label>
	</div>
</fieldset>
