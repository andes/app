import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { ICiudadano } from '../interfaces/ICiudadano';

@Injectable()
export class InscripcionService {
    // URL to web api
    private inscripcionUrl = '/modules/vacunas/inscripcion-vacunas';

    constructor(private server: Server) { }

    search(params): Observable<any> {
        return this.server.get(`${this.inscripcionUrl}/consultas`, { params });
    }

    save(ciudadano: ICiudadano): Observable<any> {
        return this.server.post(this.inscripcionUrl, ciudadano);
    }

}
