import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';
import { IPrestacion } from '../interfaces/prestacion.interface';

@Injectable()
export class AdjuntosService {

    private prestacionesUrl = '/modules/rup/prestaciones-adjuntar';  // URL to web api

    constructor(private server: Server, public auth: Auth) { }

    /**
     * Solicitad a la app mobile archivos
     *
     * @param {*} params Opciones de busqueda
     * @param {*} [options={}] Options a pasar a la API
     * @returns {Observable<IPrestacion[]>}
     *
     * @memberof AdjuntosService
     */
    post(params: any, options: any = {}): Observable<IPrestacion[]> {
        // if (typeof options.showError === 'undefined') {
        //     options.showError = true;
        // }
        // let opt;
        // opt = {
        //     params: params,
        //     options
        // };

        return this.server.post(this.prestacionesUrl, params);
    }

    /**
     *
     * @param params.id id devuelto por el metodo post.
     * @param params.estado estado para filtrar.
     */

    get (params) {
        return this.server.get(this.prestacionesUrl, { params });
    }


    /**
     * Borra una solicitud de ajuntar archivo
     */
    delete (id) {
        return this.server.delete(this.prestacionesUrl + '/' + id);
    }
}
