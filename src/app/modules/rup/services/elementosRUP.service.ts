import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { cacheStorage, Server } from '@andes/shared';
import { IElementoRUP } from './../interfaces/elementoRUP.interface';
import { IElementosRUPCache } from './../interfaces/elementosRUPCache.interface';
import { ISnomedConcept } from './../interfaces/snomed-concept.interface';
import { IPrestacionRegistro } from '../interfaces/prestacion.registro.interface';

const url = '/modules/rup/elementosRUP';

@Injectable()
export class ElementosRUPService {
    // Mantiene un caché de la base de datos de elementos
    public cache: IElementosRUPCache = {};
    public cacheById: IElementosRUPCache = {};
    // Mantiene un caché de la base de datos de elementos
    private cacheParaSolicitud: IElementosRUPCache = {};
    // Precalcula los elementos default
    private defaults: IElementosRUPCache = {};
    // Precalcula los elementos default para solicitudes
    private defaultsParaSolicitud: IElementosRUPCache = {};

    // Indica que el servicio está listo para usarse.
    // BehaviorSubject permite que el subscribe se ejecute con el ultimo valor (aunque no haya cambios)
    public ready = new BehaviorSubject<boolean>(false);

    /**
     * Este objeto se llena con el valor de params de un elementoRUP,
     * según cómo esté definido en la colección dentro de sus "requeridos"
     * Su estructura es
     * 'conceptId': {
            titulo: 'My título',
            refsetId: 'conceptId',
            tipoSelect: 'radio' | 'select',
            multiple: true | false
        }
     */
    public coleccionRetsetId = {};

    constructor(private server: Server) {
        // Precachea la lista completa de elementos RUP
        this.get().subscribe((data: IElementoRUP[]) => {
            this.cache = {};
            data.forEach(e => this.cacheById[e.id] = e);
            // Precalcula los defaults
            data.filter(e => !e.inactiveAt).forEach(elementoRUP => {
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
    get(): Observable<IElementoRUP[]> {
        return this.server.get(url, { showError: true }).pipe(
            // cacheStorage({ key: 'elementos-rup-v1', ttl: 60 * 8 })
        );
    }


    getById(id: string) {
        return this.populateElemento(this.cacheById[id], false);
    }

    /**
     * Busca el elementoRUP que implemente el concepto o la instancia que fue utilizada en su momento
     * segun el ID del elementoRUP.
     *
     * @param {IPrestacionRegistro} registro Registro de una prestación
     * @returns {IElementoRUP} Elemento que implementa el concepto
     * @memberof ElementosRUPService
     */
    elementoRegistro(registro: IPrestacionRegistro) {
        if (registro.elementoRUP) {
            return this.populateElemento(this.cacheById[registro.elementoRUP], registro.esSolicitud);
        } else {
            return this.buscarElemento(registro.concepto, registro.esSolicitud);
        }
    }

    /**
     * Devuelve los parametros de un elementoRUP.
     *
     * @param {IPrestacionRegistro} registro Registro de una prestación
     * @returns {IElementoRUP} Elemento que implementa el concepto
     * @memberof ElementosRUPService
     */

    getParams(registro) {
        const elem = this.elementoRegistro(registro);
        if (elem) {
            return elem.params;
        }
        return {};
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
        // Busca el elemento RUP que implemente el concepto
        if (typeof concepto.conceptId === 'undefined') {
            concepto = concepto[1];
        }
        concepto.semanticTag = concepto.semanticTag === 'plan' ? 'procedimiento' : concepto.semanticTag;
        if (esSolicitud) {
            let elemento = this.cacheParaSolicitud[concepto.conceptId];
            if (elemento) {
                return this.populateElemento(elemento, esSolicitud);
            } else {
                return this.populateElemento(this.defaultsParaSolicitud[concepto.semanticTag], esSolicitud);
            }
        } else {
            let elemento = this.cache[concepto.conceptId];
            if (elemento) {
                return this.populateElemento(elemento, esSolicitud);
            } else {
                return this.populateElemento(this.defaults[concepto.semanticTag], esSolicitud);
            }
        }
    }

    /**
     * Popula los requeridos de un elemento rup
     */

    populateElemento(elemento: IElementoRUP, esSolicitud: boolean) {
        if (!elemento) {
            return;
        }
        elemento.requeridos.forEach((elem) => {
            if (!elem.elementoRUP) {
                elem.elementoRUP = this.buscarElemento(elem.concepto, esSolicitud);
                elem.params = { ...elem.elementoRUP.params, ...(elem.params || {}) };
                elem.style = { ...(elem.elementoRUP.style || {}), ...(elem.style || {}) } as any;
            } else if (typeof (elem.elementoRUP as any) === 'string') {
                elem.elementoRUP = this.populateElemento(this.cacheById[elem.elementoRUP as any], false);
            }
        });
        return elemento;
    }

    getConceptosInternacion() {
        let conceptosInternacion = {
            // Lo pongo así porque no tiene sentido lo que hicieron con los otros conceptos
            // Pronto este listado no tiene más sentido
            valoracionInicial: {
                conceptId: '5491000013101',
                term: 'evaluación médica inicial',
                fsn: 'evaluación médica inicial (procedimiento)',
                semanticTag: 'procedimiento',
            },
            evolucion: {
                conceptId: '5971000013106',
                term: 'evolución médica',
                fsn: 'evolución médica (procedimiento)',
                semanticTag: 'procedimiento',
            },
            indicaciones: {
                conceptId: '4981000013105',
                term: 'plan de indicaciones médicas',
                fsn: 'plan de indicaciones médicas (procedimiento)',
                semanticTag: 'procedimiento',
            },
            epicrisis: this.cache['2341000013106'] ? this.cache['2341000013106'].conceptos[0] : null,
            ingreso: this.cache['721915006'] ? this.cache['721915006'].conceptos[0] : null,
            egreso: this.cache['58000006'] ? this.cache['58000006'].conceptos[0] : null
        };
        return conceptosInternacion;
    }

    desvincularOdontograma(registrosRelacionados, regitroActual, registroId) {
        if (registrosRelacionados[registroId] && registrosRelacionados[registroId].cara) {
            const cara = registrosRelacionados[registroId].cara;
            const term = registrosRelacionados[registroId].concepto.term;
            return regitroActual.relacionadoCon.filter(rr => rr.cara !== cara || rr.concepto.term !== term);
        } else {
            return regitroActual.relacionadoCon;
        }
    }

    getConceptoDerivacion() {
        return {
            conceptId: '107724000',
            term: 'traslado del paciente',
            fsn: 'traslado del paciente (procedimiento)',
            semanticTag: 'procedimiento'
        };
    }

}
