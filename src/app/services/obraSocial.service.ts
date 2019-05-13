import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Observable';
import { IObraSocial } from '../interfaces/IObraSocial';
import { IFinanciador } from '../interfaces/IFinanciador';

@Injectable()
export class ObraSocialService {
    private url = '/modules/obraSocial';  // URL to web api

    constructor(private server: Server) { }
    /**
     * Obtiene los datos de la obra social asociada a un paciente
     *
     * @param {*} dni, periodo
     * @returns {Observable<IObraSocial>}
     * @memberof ObraSocialService
     */

    get(opciones: any, showError = true): Observable<IObraSocial[]> {
        return this.server.get(this.url + '/puco/', { params: opciones, showError: showError });
    }

    getPaciente(opciones: any, showError = true): Observable<IFinanciador[]> {
        return this.server.get(this.url + '/paciente/', { params: opciones, showError: showError });
    }

    getPadrones(opciones: any): Observable<any[]> {
        return this.server.get(this.url + '/puco/padrones', { params: opciones });
    }

    getListado(opciones: any): Observable<any[]> {
        return this.server.get(this.url + '/', { params: opciones });
    }

    getPrepagas(): Observable<any[]> {
        return this.server.get(this.url + '/prepagas/');
    }

    getSumar(opciones: any): Observable<any[]> {
        return this.server.get(this.url + '/sumar/');
    }

    getObrasSociales(opciones: any, showError = true): Observable<IFinanciador[]> {
        return this.server.get(this.url + '/os/', { params: opciones, showError: showError });
    }


}
