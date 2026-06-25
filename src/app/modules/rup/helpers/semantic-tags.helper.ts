export const SEMANTIC_TAGS_CON_PLANTILLA = [
    'procedimiento',
    'elemento de registro',
    'régimen/tratamiento',
    'situación',
    'hallazgo',
    'evento'
];

export function permitePlantilla(semanticTag: string): boolean {
    return SEMANTIC_TAGS_CON_PLANTILLA.includes(semanticTag);
}
