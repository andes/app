import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { IBarrio } from './../interfaces/IBarrio';
import { IProfe } from '../interfaces/IProfe';

@Injectable()
export class ProfeService {
    private url = '/modules/obraSocial';  // URL to web api

    constructor(private server: Server) { }
    /**
     * Obtiene los datos del plan programa Incluir Salud de un paciente
     *
     * @param {*} dni
     * @returns {Observable<IProfe>}
     * @memberof ProfeService
     */

    get(opciones: any, showError = true): Observable<IProfe> {
        return this.server.get(this.url + '/profe/', { params: opciones, showError: showError });
    }

    getPadrones(opciones: any): Observable<any[]> {
        return this.server.get(this.url + '/profe/padrones', { params: opciones });
    }
}
