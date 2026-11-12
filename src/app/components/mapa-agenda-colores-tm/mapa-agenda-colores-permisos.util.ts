import { Auth } from '@andes/auth';
import {
    IMapaAgendaColor,
    MAPA_AGENDA_COLOR_PERMISO_GLOBAL,
    MAPA_AGENDA_COLOR_PERMISO_ORGANIZACION,
    MAPA_AGENDA_COLOR_PERMISO_PROFESIONAL,
    MapaAgendaColorAlcance
} from '../../interfaces/IMapaAgendaColor';

export function puedeAccederAbmMapaAgendaColores(auth: Auth): boolean {
    return (
        auth.check(MAPA_AGENDA_COLOR_PERMISO_GLOBAL) ||
        auth.check(MAPA_AGENDA_COLOR_PERMISO_ORGANIZACION) ||
        auth.check(MAPA_AGENDA_COLOR_PERMISO_PROFESIONAL)
    );
}

export function alcancesCreables(auth: Auth): MapaAgendaColorAlcance[] {
    const opciones: MapaAgendaColorAlcance[] = [];
    if (auth.check(MAPA_AGENDA_COLOR_PERMISO_GLOBAL)) {
        opciones.push('global');
    }
    if (auth.check(MAPA_AGENDA_COLOR_PERMISO_ORGANIZACION)) {
        opciones.push('organizacion');
    }
    if (auth.check(MAPA_AGENDA_COLOR_PERMISO_PROFESIONAL)) {
        opciones.push('profesional');
    }
    return opciones;
}

export function puedeMutarMapaAgendaColor(auth: Auth, doc: IMapaAgendaColor): boolean {
    if (!doc?.alcance) {
        return false;
    }
    if (doc.alcance === 'global') {
        return auth.check(MAPA_AGENDA_COLOR_PERMISO_GLOBAL);
    }
    const sesionOrgId = auth.organizacion?.id != null ? String(auth.organizacion.id) : null;
    const docOrgId = doc.organizacion?._id != null
        ? String(doc.organizacion._id)
        : (doc.organizacion?.id != null ? String(doc.organizacion.id) : null);
    if (!sesionOrgId || !docOrgId || sesionOrgId !== docOrgId) {
        return false;
    }
    if (doc.alcance === 'organizacion') {
        return auth.check(MAPA_AGENDA_COLOR_PERMISO_ORGANIZACION);
    }
    if (doc.alcance === 'profesional') {
        if (auth.check(MAPA_AGENDA_COLOR_PERMISO_PROFESIONAL)) {
            return true;
        }
        const profSesion = auth.profesional != null && auth.profesional !== ''
            ? String(auth.profesional)
            : null;
        const docProfId = doc.profesional?._id != null
            ? String(doc.profesional._id)
            : (doc.profesional?.id != null ? String(doc.profesional.id) : null);
        return Boolean(profSesion && docProfId && profSesion === docProfId);
    }
    return false;
}

export function etiquetaAlcance(alcance: MapaAgendaColorAlcance): string {
    switch (alcance) {
        case 'global':
            return 'Global';
        case 'organizacion':
            return 'Organización';
        case 'profesional':
            return 'Profesional';
        default:
            return alcance;
    }
}
