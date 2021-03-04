import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { ICiudadano } from '../interfaces/ICiudadano';

@Injectable()
export class InscripcionService {
    // URL to web api
    private inscripcionUrl = '/modules/vacunas/inscripcion-vacunas';

    constructor(private server: Server) { }

    // get(params: any): Observable<any[]> {
    //     return this.server.get(this.reglaUrl, { params: params, showError: true });
    // }

    // getById(id: String): Observable<any> {
    //     return this.server.get(this.reglaUrl + '/' + id, null);
    // }

    save(ciudadano: ICiudadano): Observable<any> {
        return this.server.post(this.inscripcionUrl, ciudadano);
    }

    // delete(params: any): Observable<any[]> {
    //     return this.server.delete(this.reglaUrl, { params: params, showError: true });
    // }

}
