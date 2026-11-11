import { ISnomedConcept } from '../modules/rup/interfaces/snomed-concept.interface';
import { ITipoPrestacion } from './ITipoPrestacion';
import { IServicioIntermedio } from './IServicioIntermedio';

/**
 * Resuelve el id de documento TM desde respuestas que traen `id` y/o `_id`.
 */
export function getServicioIntermedioId(doc: Pick<IServicioIntermedio, 'id' | '_id'> | null | undefined): string | undefined {
    if (!doc) {
        return undefined;
    }
    return doc.id ?? doc._id;
}

/**
 * Normaliza una respuesta del API al modelo de formulario/listado.
 * - Unifica `id` desde `_id` cuando haga falta (patrón común en recursos TM / Mongoose).
 * - No renombra campos del recurso (el schema ya es camelCase); si en el futuro apareciera snake_case,
 *   centralizar el mapeo aquí.
 */
export function normalizeServicioIntermedioFromApi(raw: Partial<IServicioIntermedio> & { _id?: string }): IServicioIntermedio {
    const id = raw.id ?? raw._id;
    return {
        ...raw,
        ...(id !== undefined ? { id: String(id) } : {}),
        ...(raw._id !== undefined ? { _id: String(raw._id) } : {}),
        nombre: raw.nombre ?? '',
        concepto: raw.concepto ? normalizeSnomedConcept(raw.concepto) : undefined,
        conceptosTurneables: raw.conceptosTurneables?.map(normalizeSnomedConcept),
        procedimientos: raw.procedimientos?.map(normalizeSnomedConcept),
        procedimientosEcl: raw.procedimientosEcl ?? undefined
    };
}

/**
 * Asegura el shape SNOMED esperado por la API (`SnomedConceptRaw`-compatible) cuando el origen
 * es un concepto genérico o un ítem de `tmPrestaciones` / {@link ITipoPrestacion} (`id` + `conceptId`).
 */
export function normalizeSnomedConcept(
    c: Partial<ISnomedConcept> & Partial<Pick<ITipoPrestacion, 'id' | 'conceptId'>> | null | undefined
): ISnomedConcept | undefined {
    if (!c) {
        return undefined;
    }
    const conceptId = c.conceptId ?? c.id;
    if (conceptId == null || c.term == null || c.fsn == null || c.semanticTag == null) {
        return undefined;
    }
    return {
        id: c.id,
        conceptId,
        term: c.term,
        fsn: c.fsn,
        semanticTag: c.semanticTag,
        noNominalizada: c.noNominalizada,
        esSolicitud: c.esSolicitud
    };
}

/**
 * Prepara conceptos para POST/PATCH cuando el select devuelve prestaciones (`id` como conceptId SNOMED).
 * Omite entradas incompletas.
 */
export function mapConceptosTurneablesForApi(
    items: Array<Partial<ISnomedConcept> & Partial<Pick<ITipoPrestacion, 'id' | 'conceptId'>>> | null | undefined
): ISnomedConcept[] {
    if (!items?.length) {
        return [];
    }
    return items.map(normalizeSnomedConcept).filter((x): x is ISnomedConcept => !!x);
}
