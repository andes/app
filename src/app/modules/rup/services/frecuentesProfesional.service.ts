import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs';
import { Server } from '@andes/shared';
import { SemanticTag } from '../interfaces/semantic-tag.type';
import { ISnomedConcept } from './../interfaces/snomed-concept.interface';
import { IFrecuentesProfesional } from '../interfaces/frecuentesProfesional.interface';

const url = '/modules/rup/frecuentesProfesional';
const urlPrestacion = '/modules/rup/frecuentesPrestacion';

@Injectable()
export class FrecuentesProfesionalService {

    constructor(private server: Server) { }

    /**
     * Metodo getById. Trae el objeto elementoRup por su Id.
     * @param {String} idProfesional Busca por Id
     */
    getById(idProfesional: String): Observable<IFrecuentesProfesional> {
        return this.server.get(url + '/' + idProfesional);
    }

    /**
     * Metodo get. Trae lista de elementosRup más frecuentes.
     *
     * @param {*} params Opciones de busqueda
     * @param {*} [options={}] Options a pasar a la API
     * @returns {Observable<IPrestacion[]>}
     *
     * @memberof PrestacionesService
     */
    get(params: any, options: any = {}): Observable<IFrecuentesProfesional[]> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        let opt = { params: params, options };
        return this.server.get(url, opt);
    }


    /**
     * Metodo getXPrestacion. Lista los frecuentes por tipo de prestación.
     *
     * @param {*} params Opciones de busqueda
     * @param {*} [options={}] Options a pasar a la API
     * @returns {Observable<any[]>}
     *
     * @memberof PrestacionesService
     */
    getXPrestacion(params: any, options: any = {}): Observable<any[]> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        let opt = { params: params, options };

        return this.server.get(url, opt);
    }


    /**
     * Metodo post. Inserta un objeto elementoRup nuevo.
     * @param {IFrecuentesProfesional} elementoRup Recibe IFrecuentesProfesional
     */
    post(elementoRup: IFrecuentesProfesional): Observable<IFrecuentesProfesional> {
        return this.server.post(url, elementoRup);
    }

    updateFrecuentes(id: String, registros: any): Observable<any> {
        return this.server.put(url + '/' + id, registros);
    }
}
