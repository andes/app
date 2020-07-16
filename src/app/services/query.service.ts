import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { IFiltroQuery } from '../interfaces/IFiltroQuery';

@Injectable()
export class QueriesService {

    private biUrl = '/bi';  // URL to web api

    constructor(private server: Server) {
    }

    // Retorna todas las queries guardadas en la base de datos
    getAllQueries(params): Observable<any> {
        const res = this.server.get(`${this.biUrl}/queries`, { params, showError: true });
        return res;
    }

    // Devuelve el resultado de ejecutar la query enviada por parametro
    getQuery(nombre: String, params) {
        return this.server.get(`${this.biUrl}/queries/${nombre}/json`, { params });
    }

    descargarCsv(nombre: String, params) {
        const options: any = { params, responseType: 'blob' };
        return this.server.get(`${this.biUrl}/queries/${nombre}/csv`, options);
    }
}
