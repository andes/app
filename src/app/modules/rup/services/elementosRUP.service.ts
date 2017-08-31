import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../../environments/environment';
import { Server } from '@andes/shared';
import { SemanticTag } from '../interfaces/semantic-tag.type';
import { IElementoRUP } from './../interfaces/elementoRUP.interface';
import { IElementosRUPCache } from './../interfaces/elementosRUPCache.interface';
import { ISnomedConcept } from './../interfaces/snomed-concept.interface';
import { Subject } from 'rxjs/Subject';

const url = '/modules/rup/elementosRUP';

@Injectable()
export class ElementosRUPService {
    // Mantiene un caché de la base de datos de elementos
    private cache: IElementosRUPCache = {};
    // Mantiene un caché de la base de datos de elementos
    private cacheParaSolicitud: IElementosRUPCache = {};
    // Precalcula los elementos default
    private defaults: IElementosRUPCache = {};
    // Precalcula los elementos default para solicitudes
    private defaultsParaSolicitud: IElementosRUPCache = {};
    // Indica que el servicio está listo para usarse
    public ready: Subject<boolean> = new Subject<boolean>();

    constructor(private server: Server) {
        // Precachea la lista completa de elementos RUP
        this.server.get(url).subscribe((data: IElementoRUP[]) => {
            this.cache = {};

            // Precalcula los defaults
            data.forEach(elementoRUP => {
                elementoRUP.conceptos.forEach((concepto) => {
                    if (elementoRUP.esSolicitud) {
                        this.cacheParaSolicitud[concepto.conceptId] = elementoRUP;
                    } else {
                        this.cache[concepto.conceptId] = elementoRUP;
                    }
                });
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

            // Notifica que el servicio está listo
            this.ready.next(true);
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
     * Busca el elementoRUP que implemente el concepto
     *
     * @param {ISnomedConcept} concepto Concepto de SNOMED
     * @param {boolean} esSolicitud Indica si es una solicitud
     * @returns {IElementoRUP} Elemento que implementa el concepto
     * @memberof ElementosRUPService
     */
    buscarElemento(concepto: ISnomedConcept, esSolicitud: boolean): IElementoRUP {
        debugger;
        // Busca el elemento RUP que implemente el concepto
        if (esSolicitud) {
            let elemento = this.cacheParaSolicitud[concepto.conceptId];
            if (elemento) {
                return elemento;
            } else {
                return this.defaultsParaSolicitud[concepto.semanticTag];
            }
        } else {
            let elemento = this.cache[concepto.conceptId];
            if (elemento) {
                return elemento;
            } else {
                return this.defaults[concepto.semanticTag];
            }
        }
    }
}
