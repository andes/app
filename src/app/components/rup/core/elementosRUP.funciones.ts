import { IElementoRUP } from './../../../interfaces/IElementoRUP';

/**
 * Funcion que dado un array con elementosRup y un concepto snomed 
 * retorna el elementoRup que incluya el concetoSnomend en su lista
 * de conceptos 
 * 
 * @export
 */
export function buscarElementoRup(listaElementosRup: any, conceptoSnome: any) {
    debugger;
    let dato: any = listaElementosRup.find(elemento => {
        let unConcepto = elemento.conceptos.find(concepto =>
            concepto.conceptId === conceptoSnome.conceptId
        );
        return unConcepto;
    });

    return dato;
}