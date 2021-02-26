import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class InscripcionService {

    // URL to web api
    // private reglaUrl = '/modules/top/reglas';

    constructor(private server: Server) { }

    // get(params: any): Observable<any[]> {
    //     return this.server.get(this.reglaUrl, { params: params, showError: true });
    // }

    // getById(id: String): Observable<any> {
    //     return this.server.get(this.reglaUrl + '/' + id, null);
    // }

    // save(reglas: any): Observable<any> {
    //     return this.server.post(this.reglaUrl, reglas);
    // }

    // delete(params: any): Observable<any[]> {
    //     return this.server.delete(this.reglaUrl, { params: params, showError: true });
    // }

}
