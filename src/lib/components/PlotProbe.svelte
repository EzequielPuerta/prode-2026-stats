<script lang="ts">
	import { usePlot } from 'svelteplot';

	// Expone reactivamente las escalas del <Plot> padre hacia afuera. Debe
	// renderizarse dentro de un <Plot> para tener acceso a su contexto.
	let { onscales }: { onscales: (scales: unknown) => void } = $props();

	const plot = usePlot();

	$effect(() => {
		onscales(plot.scales);
	});
</script>
