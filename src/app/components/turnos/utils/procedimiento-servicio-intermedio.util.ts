import { IServicioIntermedio } from 'src/app/interfaces/IServicioIntermedio';
import { ITipoPrestacion } from 'src/app/interfaces/ITipoPrestacion';
import { ISnomedConcept } from 'src/app/modules/rup/interfaces/snomed-concept.interface';

export interface ResolverProcedimientosOpcionesResult {
    procedimientosOpciones: ISnomedConcept[];
    mostrarSelect: boolean;
}

/**
 * Dado el catálogo de servicios intermedios y un tipo de prestación del turno,
 * devuelve los procedimientos SNOMED elegibles (unión de servicios que turnean ese conceptId, deduplicados por conceptId).
 */
export function resolverProcedimientosOpciones(
    servicios: IServicioIntermedio[],
    tipo?: ITipoPrestacion
): ResolverProcedimientosOpcionesResult {
    if (!tipo?.conceptId) {
        return { procedimientosOpciones: [], mostrarSelect: false };
    }

    const serviciosCoincidentes = servicios.filter(servicio =>
        servicio.conceptosTurneables?.some(ct => ct.conceptId === tipo.conceptId)
    );

    const vistos = new Set<string>();
    const procedimientos: ISnomedConcept[] = [];
    for (const servicio of serviciosCoincidentes) {
        for (const procedimiento of servicio.procedimientos ?? []) {
            if (procedimiento.conceptId && !vistos.has(procedimiento.conceptId)) {
                vistos.add(procedimiento.conceptId);
                procedimientos.push(procedimiento);
            }
        }
    }

    procedimientos.sort((a, b) =>
        (a.term ?? '').localeCompare(b.term ?? '', 'es', { sensitivity: 'base' })
    );

    return {
        procedimientosOpciones: procedimientos,
        mostrarSelect: procedimientos.length > 0,
    };
}
