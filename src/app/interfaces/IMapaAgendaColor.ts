import { ISnomedConcept } from '../modules/rup/interfaces/snomed-concept.interface';

export type MapaAgendaColorAlcance = 'global' | 'organizacion' | 'profesional';

export interface IMapaAgendaColorAmbitoNombre {
    _id?: string;
    id?: string;
    nombre?: string;
}

export interface IMapaAgendaColorProfesional {
    _id?: string;
    id?: string;
    nombre?: string;
    apellido?: string;
}

export interface IMapaAgendaColor {
    id?: string;
    _id?: string;
    concepto?: ISnomedConcept;
    color: string;
    alcance: MapaAgendaColorAlcance;
    organizacion?: IMapaAgendaColorAmbitoNombre | null;
    profesional?: IMapaAgendaColorProfesional | null;
    activo?: boolean;
}

export function getMapaAgendaColorId(doc: Pick<IMapaAgendaColor, 'id' | '_id'> | null | undefined): string | undefined {
    if (!doc) {
        return undefined;
    }
    const raw = doc.id ?? doc._id;
    return raw != null ? String(raw) : undefined;
}

export const MAPA_AGENDA_COLOR_PERMISO_GLOBAL = 'tm:mapa-agenda-colores:global:write';
export const MAPA_AGENDA_COLOR_PERMISO_ORGANIZACION = 'turnos:mapa-agenda-colores:organizacion:write';
export const MAPA_AGENDA_COLOR_PERMISO_PROFESIONAL = 'turnos:mapa-agenda-colores:profesional:write';
