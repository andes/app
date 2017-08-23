import { IElementoRUP } from './../../interfaces/IElementoRUP';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { Server } from '@andes/shared';

@Injectable()
export class ElementosRupService {
    private evolucionPorDefecto = '594aa43a884431c25d9a0267';
    private evolucionProblemaPorDefecto = '594aa21a884431c25d9a0266';
    private solicitudPorDefecto = '5964cc2aa784f4e1a8e2afe9';
    public nuevaEvolucion = {
        '_id': '596769fea784f4e1a8e2afec',
        'key': 'evolucionProblema',
        'nombre': 'Evolucionar problema',
        'activo': true,
        'autonomo': false,
        'componente': {
            'ruta': 'rup/atomos/nuevaEvolucionProblema.component.ts',
            'nombre': 'NuevaEvolucionProblemaComponent'
        },
        'tipo': 'atomo',
        'conceptos': [],
        'requeridos': [],
        'frecuentes': [],
        'turneable': false
    };

    private elementoRupUrl = '/modules/rup/elementosRUP';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Metodo get. Trae el objeto elementoRup.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<IElementoRUP[]> {
        return this.server.get(this.elementoRupUrl, { params: params, showError: true });
    }
    /**
     * Metodo getById. Trae el objeto elementoRup por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<IElementoRUP> {
        return this.server.get(this.elementoRupUrl + '/' + id, null);
    }
    /**
     * Metodo post. Inserta un objeto elementoRup nuevo.
     * @param {IElementoRUP} elementoRup Recibe IElementoRUP
     */
    post(elementoRup: IElementoRUP): Observable<IElementoRUP> {
        return this.server.post(this.elementoRupUrl, elementoRup);
    }
    /**
     * Metodo put. Actualiza un objeto elementoRup nuevo.
     * @param {IElementoRUP} elementoRup Recibe IElementoRUP
     */
    put(elementoRup: IElementoRUP): Observable<IElementoRUP> {
        return this.server.put(this.elementoRupUrl + '/' + elementoRup.id, elementoRup);
    }
    /**
     * Metodo disable. deshabilita elementoRup.
     * @param {IElementoRUP} elementoRup Recibe IElementoRUP
     */
    disable(elementoRup: IElementoRUP): Observable<IElementoRUP> {
        elementoRup.activo = false;
        return this.put(elementoRup);
    }
    /**
     * Metodo enable. habilita elementoRup.
     * @param {IElementoRUP} elementoRup Recibe IElementoRUP
     */
    enable(elementoRup: IElementoRUP): Observable<IElementoRUP> {
        elementoRup.activo = true;
        return this.put(elementoRup);
    }

    /**
     * Traemos el elemento rup asociado al concepto de SNOMED
     * de la lista de elementos rup precargados en memoria
     *
     * @param {*} listaElementosRup
     * @param {*} conceptoSnomed
     * @returns elementoRUP
     * @memberof ElementosRupService
     */
    buscarElementoRup(listaElementosRup: any, conceptoSnomed: any, tipo: string) {
        let elementoRUP: any;
        // si es trastorno o hallazgo, busco su forma de evolucionar por defecto
        if (tipo === 'problemas') {
            elementoRUP = listaElementosRup.find(elemento => {
                return elemento.conceptos.find(concepto =>
                    concepto.conceptId === conceptoSnomed.conceptId
                );
            });

            // si no encontramos una forma de evolucionar, devolvemos el elemento por defecto
            if (!elementoRUP) {
                elementoRUP = listaElementosRup.find(elemento => elemento.id === this.evolucionProblemaPorDefecto);
            }
            return elementoRUP;
            // elementoRUP = listaElementosRup.find(elemento => elemento.id === this.evolucionProblemaPorDefecto);
            // return elementoRUP;
        } else {
            if (tipo === 'procedimientos') {
                // si es un procedimiento buscamos su propia forma de evolucionar
                elementoRUP = listaElementosRup.find(elemento => {
                    return elemento.conceptos.find(concepto =>
                        concepto.conceptId === conceptoSnomed.conceptId
                    );
                });

                // si no encontramos una forma de evolucionar, devolvemos el elemento por defecto
                if (!elementoRUP) {
                    elementoRUP = listaElementosRup.find(elemento => elemento.id === this.evolucionPorDefecto);
                }
                return elementoRUP;
            } else {
                if (tipo === 'planes') {
                    // si es un plan autocitado buscamos su elemento
                    if (conceptoSnomed.conceptId === '281036007') {
                        elementoRUP = listaElementosRup.find(elemento => {
                            return elemento.conceptos.find(concepto =>
                                concepto.conceptId === '281036007'
                            );
                        });
                    } else {
                        // Si no es autocitado le asignamos  por defecto.
                        elementoRUP = listaElementosRup.find(elemento => elemento.id === this.solicitudPorDefecto);
                    }
                    return elementoRUP;
                }
            }
        }



    }
}
