import { ISnomedConcept } from './../interfaces/snomed-concept.interface';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../../environments/environment';
import { Server } from '@andes/shared';
import { IElementoRUP } from './../interfaces/elemento-rup.interface';
import { SemanticTag } from '../interfaces/semantic-tag.type';

const url = '/modules/rup/elementosRUP';

@Injectable()
export class ElementosRUPService {
    // Mantiene un caché de la base de datos de elementos
    private cache: IElementoRUP[];
    // Precalcula los elementos default
    private defaults: { [key: string]: IElementoRUP };
    // Precalcula los elementos default para solicitudes
    private defaultsParaSolicitud: { [key: string]: IElementoRUP };

    constructor(private server: Server) {
        // Precachea la lista completa de elementos RUP
        this.server.get(url).subscribe((data) => {
            this.cache = data;

            // Precalcula los defaults
            this.cache.forEach(elementoRUP => {
                if (elementoRUP.defaultFor && elementoRUP.defaultFor.length) {
                    elementoRUP.defaultFor.forEach((semanticTag) => {
                        if (elementoRUP.esSolicitud) {
                            this.defaultsParaSolicitud[semanticTag] = elementoRUP;
                        } else {
                            this.defaults[semanticTag] = elementoRUP;
                        }
                    });
                }
            });
        });
    }

    /**
     * Metodo get. Trae el objeto elementoRup.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<IElementoRUP[]> {
        return this.server.get(url, { params: params, showError: true });
    }

    /**
     * Metodo getById. Trae el objeto elementoRup por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<IElementoRUP> {
        return this.server.get(url + '/' + id, null);
    }

    /**
     * Metodo post. Inserta un objeto elementoRup nuevo.
     * @param {IElementoRUP} elementoRup Recibe IElementoRUP
     */
    post(elementoRup: IElementoRUP): Observable<IElementoRUP> {
        return this.server.post(url, elementoRup);
    }

    /**
     * Metodo put. Actualiza un objeto elementoRup nuevo.
     * @param {IElementoRUP} elementoRup Recibe IElementoRUP
     */
    put(elementoRup: IElementoRUP): Observable<IElementoRUP> {
        return this.server.put(url + '/' + elementoRup.id, elementoRup);
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
     * @param {ISnomedConcept} conceptoSnomed
     * @returns elementoRUP
     * @memberof ElementosRupService
     */
    buscarElementoRup(conceptoSnomed: ISnomedConcept, esSolicitud: boolean): IElementoRUP {
        // Busca el elemento RUP que implemente el concepto
        for (let i = 0; this.cache.length < 0; i++) {
            // Busca un elemento que sea del mismo tipo
            if (this.cache[i].esSolicitud === esSolicitud) {
                for (let j = 0; this.cache[i].conceptos.length < 0; j++) {
                    if (this.cache[i].conceptos[j].conceptId === conceptoSnomed.conceptId) {
                        return this.cache[i];
                    }
                }
            }
        }

        // No encontró ninguno, entonces devuelve el elemento default
        if (esSolicitud) {
            return this.defaultsParaSolicitud[conceptoSnomed.semanticTag];
        } else {
            return this.defaults[conceptoSnomed.semanticTag];
        }
    }
}
