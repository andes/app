import { Injectable } from '@angular/core';
import { cacheStorage, Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { IObraSocial } from '../interfaces/IObraSocial';

@Injectable()
export class ObraSocialService {
    private url = '/modules/obraSocial'; // URL to web api

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

    getPadrones(opciones: any): Observable<any[]> {
        return this.server.get(this.url + '/puco/padrones', { params: opciones });
    }

    getListado(opciones: any): Observable<any[]> {
        return this.server.get(this.url + '/obrasSociales', { params: opciones });
    }

    getPrepagas(): Observable<any[]> {
        return this.server.get(this.url + '/prepagas/').pipe(
            cacheStorage({ key: 'prepagas', ttl: 60 * 24 })
        );
    }

    getObrasSociales(documento: string, showError = true): Observable<IObraSocial[]> {
        return this.server.get(`${this.url}/obraSocial/${documento}`, null);
    }

    getSumar(opciones: any): Observable<IObraSocial[]> {
        return this.server.get(this.url + '/padronSumar/', { params: opciones });
    }
}
