import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Server } from '@andes/shared';
import { IDireccion } from '../interfaces/IDireccion';

@Injectable()
export class GeoReferenciaService {
    private url = '/modules/georeferencia';  // URL to web api

    constructor(private server: Server) { }
    /**
     *
     * @param direccion
     * @returns point: [lat, lng] o null
     */
    post(direccion: any): Observable<any> {
        return this.server.post(this.url + '/getGooglePoint', direccion);
    }
}
