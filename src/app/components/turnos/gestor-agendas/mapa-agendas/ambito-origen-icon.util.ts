import { AMBITOS_ORIGEN, AmbitoOrigen } from 'src/app/modules/rup/interfaces/prestacion.interface';

const ICONOS_AMBITO_ORIGEN: Record<AmbitoOrigen, string> = {
    ambulatorio: 'clipboard-check-outline',
    internacion: 'cama',
    guardia: 'hospital-building',
};

/** Nombre de glyph para `plex-icon` según `turno.ambitoOrigen`; ambulatorio si no hay ámbito. */
export function iconoAmbitoOrigen(ambito?: AmbitoOrigen | null): string {
    const id = ambito ?? 'ambulatorio';
    return ICONOS_AMBITO_ORIGEN[id] ?? ICONOS_AMBITO_ORIGEN.ambulatorio;
}

/** Etiqueta legible (p. ej. tooltip) desde `AMBITOS_ORIGEN.nombre`; null si no hay ámbito. */
export function etiquetaAmbitoOrigen(ambito?: AmbitoOrigen | null): string | null {
    if (!ambito) {
        return null;
    }
    const opcion = AMBITOS_ORIGEN.find((item) => item.id === ambito);
    return opcion?.nombre ?? null;
}
