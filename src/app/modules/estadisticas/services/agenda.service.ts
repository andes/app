import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { Server, saveAs } from '@andes/shared';
import { Observable } from 'rxjs';

@Injectable()
export class EstAgendasService {

    private baseURL = '/modules/turnos';  // URL to web api

    constructor(private server: Server, public auth: Auth) { }

    /**
     *
     * @param params Filtros de busqueda
     */

    post(params) {
        return this.server.post(this.baseURL + '/dashboard', params);
    }

    postFiltroPorCiudad(params) {
        return this.server.post(this.baseURL + '/dashboard/localidades', params);
    }

    download(data): Observable<any> {
        return this.server.post(this.baseURL + '/dashboard/descargarCsv', data, { responseType: 'blob' } as any);
    }

    descargarCSV(data, nombreArchivo: string): Observable<any> {
        return this.download(data).pipe(
            saveAs(nombreArchivo, 'csv')
        );
    }

}
