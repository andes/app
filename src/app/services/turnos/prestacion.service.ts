import { Server } from 'andes-shared/src/lib/server/server.service';
import { AppSettings } from './../../appSettings';
import { IPrestacion } from './../../interfaces/turnos/IPrestacion';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class PrestacionService {
    private prestacionUrl = AppSettings.API_ENDPOINT + '/modules/turnos/prestacion';
    constructor(private http: Http, private server: Server) { }

    /**
     * Metodo get. Trae el objeto prestacion.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<IPrestacion[]> {
        return this.server.get(this.prestacionUrl, {params: params, showError: true});
    }
    /**
     * Metodo post. Inserta un objeto prestacion nuevo.
     * @param {IPrestacion} prestacion Recibe IPrestacion
     */
    post(prestacion: IPrestacion): Observable<IPrestacion> {
        return this.server.post(this.prestacionUrl, prestacion);
    }
    /**
     * Metodo put. Actualiza un objeto prestacion nuevo.
     * @param {IPrestacion} prestacion Recibe IPrestacion
     */
    put(prestacion: IPrestacion): Observable<IPrestacion> {
        return this.server.put(this.prestacionUrl + '/' + prestacion.id, prestacion)
    }
    /**
     * Metodo disable. deshabilita prestacion.
     * @param {IEspecialidad} prestacion Recibe IPrestacion
     */
    disable(prestacion: IPrestacion): Observable<IPrestacion> {
        prestacion.activo = false;
        prestacion.fechaBaja = new Date();
        return this.put(prestacion);
    }
   /**
     * Metodo enable. habilita prestacion.
     * @param {IPrestacion} prestacion Recibe IPrestacion
     */
    enable(prestacion: IPrestacion): Observable<IPrestacion> {
        prestacion.activo = true;
        return this.put(prestacion);
    }
    handleError(error: any) {
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }
}
