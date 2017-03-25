import { Server } from '@andes/shared';
import { IPrestacion } from './../../interfaces/turnos/IPrestacion';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class PrestacionService {
    private prestacionUrl = '/modules/turnos/prestacion';
    constructor(private server: Server) { }

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
}
