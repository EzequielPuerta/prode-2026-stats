const NAME_TO_CODE: Record<string, string> = {
	// Anfitrionas
	Canadá: 'ca',
	México: 'mx',
	'Estados Unidos': 'us',
	// AFC
	Australia: 'au',
	Irán: 'ir',
	Japón: 'jp',
	Jordania: 'jo',
	'Corea del Sur': 'kr',
	Qatar: 'qa',
	'Arabia Saudita': 'sa',
	Uzbekistán: 'uz',
	Iraq: 'iq',
	// CAF
	Argelia: 'dz',
	'Cabo Verde': 'cv',
	'Costa de Marfil': 'ci',
	Egipto: 'eg',
	Ghana: 'gh',
	Marruecos: 'ma',
	Senegal: 'sn',
	Sudáfrica: 'za',
	Túnez: 'tn',
	'RD Congo': 'cd',
	// CONCACAF
	Curaçao: 'cw',
	Haiti: 'ht',
	Panamá: 'pa',
	// CONMEBOL
	Argentina: 'ar',
	Brasil: 'br',
	Colombia: 'co',
	Ecuador: 'ec',
	Paraguay: 'py',
	Uruguay: 'uy',
	// OFC
	'Nueva Zelanda': 'nz',
	// UEFA
	Austria: 'at',
	Bélgica: 'be',
	'Bosnia-Herzegovina': 'ba',
	Croacia: 'hr',
	'República Checa': 'cz',
	Inglaterra: 'gb-eng',
	Francia: 'fr',
	Alemania: 'de',
	'Países Bajos': 'nl',
	Noruega: 'no',
	Portugal: 'pt',
	Escocia: 'gb-sct',
	España: 'es',
	Suecia: 'se',
	Suiza: 'ch',
	Turquía: 'tr'
};

export function countryCode(name: string): string | null {
	return NAME_TO_CODE[name.trim()] ?? null;
}
