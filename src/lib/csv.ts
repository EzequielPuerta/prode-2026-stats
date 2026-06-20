export function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let inQuotes = false;

	// Descartar BOM si el archivo lo trae.
	if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

	const pushField = () => {
		row.push(field);
		field = '';
	};
	const pushRow = () => {
		pushField();
		rows.push(row);
		row = [];
	};

	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				field += c;
			}
		} else if (c === '"') {
			inQuotes = true;
		} else if (c === ',') {
			pushField();
		} else if (c === '\n') {
			pushRow();
		} else if (c === '\r') {
			// Ignorar; el \n siguiente cierra la fila.
		} else {
			field += c;
		}
	}
	// Última fila si el archivo no termina en salto de línea.
	if (field.length > 0 || row.length > 0) pushRow();

	// Descartar filas totalmente vacías.
	return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}
