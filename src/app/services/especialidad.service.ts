import { AppSettings } from './../appSettings';
import { IEspecialidad } from './../interfaces/IEspecialidad';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Server } from 'andes-shared/src/lib/server/server.service';

@Injectable()
export class EspecialidadService {

    private especialidadUrl = AppSettings.API_ENDPOINT + '/core/tm/especialidades';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Metodo get. Trae el objeto especialidad.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<IEspecialidad[]> {
        return this.server.get(this.especialidadUrl, params)
    }
    /**
     * Metodo getById. Trae el objeto especialidad por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<IEspecialidad> {
        return this.server.get(this.especialidadUrl + "/" + id, null)
    }
    /**
     * Metodo post. Inserta un objeto especialidad nuevo.
     * @param {IEspecialidad} especialidad Recibe IEspecialidad
     */
    post(especialidad: IEspecialidad): Observable<IEspecialidad> {
        return this.server.post(this.especialidadUrl, especialidad);
    }
    /**
     * Metodo put. Actualiza un objeto especialidad nuevo.
     * @param {IEspecialidad} especialidad Recibe IEspecialidad
     */
    put(especialidad: IEspecialidad): Observable<IEspecialidad> {
        return this.server.put(this.especialidadUrl + "/" + especialidad.id, especialidad)
    }
    /**
     * Metodo disable. deshabilita especialidad.
     * @param {IEspecialidad} especialidad Recibe IEspecialidad
     */
    disable(especialidad: IEspecialidad): Observable<IEspecialidad> {
        especialidad.activo = false;
        especialidad.fechaBaja = new Date();
        return this.put(especialidad);
    }
    /**
     * Metodo enable. habilita especialidad.
     * @param {IEspecialidad} especialidad Recibe IEspecialidad
     */
    enable(especialidad: IEspecialidad): Observable<IEspecialidad> {
        especialidad.activo = true;
        return this.put(especialidad);
    }
}