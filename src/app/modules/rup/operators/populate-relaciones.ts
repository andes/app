import { IPrestacion } from '../interfaces/prestacion.interface';

/**
 * Tramsforma los ID de relaciones en el Registro correspondiente
 * @param prestacion
 */
export function populateRelaciones(prestacion: IPrestacion) {
    const registros = getRegistros(prestacion);
    // recorremos los registros ya almacenados en la prestación
    registros.forEach(registro => {
        // this.itemsRegistros[registro.id] = { collapse: true, items: null };
        // Si el registro actual tiene registros vinculados, los "populamos"
        if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
            registro.relacionadoCon.forEach((registroRel, key) => {
                if (typeof registroRel === 'string') {
                    const registroAux = registros.find(r => r.id === registroRel);
                    if (registroAux) {
                        registro.relacionadoCon[key] = registroAux;
                    }
                }
            });
        }

    });
    return prestacion;
}

export function unPopulateRelaciones(prestacion: IPrestacion) {
    const registros = getRegistros(prestacion);
    registros.forEach(registro => {
        if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
            registro.relacionadoCon.forEach((registroRel, key) => {
                const registroAux = prestacion.ejecucion.registros.find(r => {
                    if (r.id) {
                        return r.id === registroRel.id;
                    } else {
                        return r.concepto.conceptId === registroRel.concepto.conceptId;
                    }
                });
                // Es registro RUP o es un concepto puro?
                if (registroAux) {
                    registro.relacionadoCon[key] = registroAux.id;
                }
            });
        }
    });
    return registros;
}

/**
 * Devuelvo los "registros" reales de una prestacion.
 * Searía los conceptos ROOT.
 * @param prestacion
 */
export function getRegistros(prestacion: IPrestacion) {
    const registros = prestacion.ejecucion.registros;
    let rs = [...registros];
    registros.forEach(registro => {
        if (registro.hasSections) {
            registro.registros.forEach(seccion => {
                if (seccion.isSection) {
                    rs = [...rs, ...seccion.registros];
                }
            });
        }
    });
    return rs;
}


