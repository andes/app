import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server, saveAs } from '@andes/shared';

@Injectable()
export class QueriesService {

    private biUrl = '/bi'; // URL to web api

    constructor(private server: Server) {
    }

    // Retorna todas las queries guardadas en la base de datos
    getAllQueries(params): Observable<any> {
        return this.server.get(`${this.biUrl}/queries`, { params, showError: false });
    }

    // Devuelve el resultado de ejecutar la query enviada por parametro
    getQuery(nombre: string, params) {
        return this.server.get(`${this.biUrl}/queries/${nombre}/json`, { params });
    }

    descargarCsv(nombre, params) {
        const options: any = { params, responseType: 'blob' };
        return this.server.get(`${this.biUrl}/queries/${nombre}/csv`, options).pipe(
            saveAs(nombre, 'csv')
        );
    }
}
