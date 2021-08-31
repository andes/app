import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Server } from '@andes/shared';

@Injectable()
export class GeoreferenciaService {
    private url = '/modules/georeferencia'; // URL to web api

    constructor(private server: Server) { }
    /**
     *
     @param texto para autocompletar
 * @returns opciones
     */
    autocompletar(texto: String): Observable<any> {
        return this.server.get(this.url + '/autocompletar', { params: texto });
    }

    /**
     *
     * @param direccion
     * @returns point: [lat, lng] o null
     */
    getGeoreferencia(direccion: any): Observable<any> {
        return this.server.get(this.url + '/georeferenciar', { params: direccion });
    }
}
