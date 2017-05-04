import { Server } from '@andes/shared';
import { ILlavesTipoPrestacion } from './../../interfaces/llaves/ILlavesTipoPrestacion';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class LlavesTipoPrestacionService {
    private llaveTPUrl = '/modules/configuraciones/tipoPrestacion';  // URL to web api
    constructor(private server: Server) { }

    get(params: any): Observable<ILlavesTipoPrestacion[]> {
        return this.server.get(this.llaveTPUrl, {params: params, showError: true});
    }

    /**
     * Metodo getById. Trae el objeto LlaveTipoPrestacion por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<ILlavesTipoPrestacion> {
        return this.server.get(this.llaveTPUrl + "/" + id, null)
    }

    post(llaveTP: ILlavesTipoPrestacion): Observable<ILlavesTipoPrestacion> {
        return this.server.post(this.llaveTPUrl, llaveTP);
    }

    put(llaveTP: ILlavesTipoPrestacion): Observable<ILlavesTipoPrestacion> {
        return this.server.put(this.llaveTPUrl + '/' + llaveTP.id, llaveTP);
    }
}
