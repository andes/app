import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { Auth } from '@andes/auth';
import { Server, cache } from '@andes/shared';
import { IPrestacion } from '../interfaces/prestacion.interface';
import { switchMap } from 'rxjs/operators';

const REFRESH_INTERVAL = 1000 * 60 * 60;

@Injectable()
export class AdjuntosService {
    private timer$ = timer(0, REFRESH_INTERVAL);
    public token$ = this.timer$.pipe(
        switchMap(_ => this.generateToken()),
        cache()
    );

    private prestacionesUrl = '/modules/mobileApp/prestaciones-adjuntar';  // URL to web api

    constructor(
        private server: Server,
        public auth: Auth
    ) { }

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
        return this.server.post(this.prestacionesUrl, params);
    }

    /**
     *
     * @param params.id id devuelto por el metodo post.
     * @param params.estado estado para filtrar.
     */

    get(params) {
        return this.server.get(this.prestacionesUrl, { params });
    }


    /**
     * Borra una solicitud de ajuntar archivo
     */
    delete(id) {
        return this.server.delete(this.prestacionesUrl + '/' + id);
    }

    /**
     * Upload a file
     * @param {string} file  Archivo en Base64
     * @param {string} metadata.prestacion Id de la prestacion
     * @param {string} metadata.registro Id del registro
     */
    upload(file, metadata) {
        return this.server.post('/modules/rup/store', { file, metadata });
    }

    /**
     * Genera un token de archivo
     * [TODO] Mover a @andes/auth
     */

    generateToken() {
        return this.server.post('/auth/file-token', {});
    }
}
