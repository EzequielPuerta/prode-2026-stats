# Prode 2026 Stats

Dashboard web para analizar y comparar los pronósticos del prode jugado durante el Mundial FIFA 2026 por los *fundares*, utilizando la web de ProdeLibre para tal propósito. Toma los datos de los participantes desde archivos CSV (exportados desde dicho sitio) y calcula la tabla de posiciones a medida que se juegan los partidos, mostrando rankings, comparativas y el detalle de cada encuentro.

La gracia es que el sistema de puntuación es configurable: podés activar o desactivar el acierto de ganador/empate (1 punto), el acierto exacto (3 puntos) y los "dobles" (habilita la posibilidad de duplicar el valor obtenido en hasta 3 pronosticos por jugador), y ver al instante cómo cambia la clasificación según las reglas elegidas. También hay disponible una regla no presente en la web de ProdeLibre que otorga 2 puntos al jugador que pronostica correctamente sólo la cantidad de goles realizados por el equipo ganador. Además incluye una vista comparativa entre escenarios simultáneos para entender quién se beneficia (o no) con cada criterio.

Los datos viven en `src/lib/data/` como CSV (`pronosticos.csv` y `dobles.csv`) y se procesan en el navegador: parseo, validación y cálculo de puntajes ocurren del lado del cliente. No hay backend ni base de datos, todo es estático.

Está construido con [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5, runes), [Tailwind CSS](https://tailwindcss.com/) con [daisyUI](https://daisyui.com/) para la interfaz y [SveltePlot](https://svelteplot.dev/) para los gráficos. Se compila a sitio estático con `@sveltejs/adapter-static` y se publica automáticamente en GitHub Pages mediante GitHub Actions en cada push a `main`.

## Desarrollo

```sh
pnpm install      # instalar dependencias
pnpm dev          # servidor de desarrollo
pnpm build        # compilar a estáticos (carpeta build/)
pnpm preview      # previsualizar el build de producción
```
