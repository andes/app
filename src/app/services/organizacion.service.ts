import { AppSettings } from './../appSettings';
import { IOrganizacion } from './../interfaces/IOrganizacion';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import { ServerService } from 'andes-shared/src/lib/server.service';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class OrganizacionService {

    private organizacionUrl = AppSettings.API_ENDPOINT + '/organizaciones';  // URL to web api

    constructor(private server: ServerService, private http: Http) { }

    /**
     * Metodo get. Trae el objeto organizacion.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<IOrganizacion[]> {
        console.log ("url ", this.organizacionUrl);
        return this.server.get(this.organizacionUrl, params);
    }
    /**
     * Metodo getById. Trae el objeto organizacion por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<IOrganizacion> {
        return this.server.get(this.organizacionUrl + "/" + id, null);
    }
    /**
     * Metodo post. Inserta un objeto organizacion nuevo.
     * @param {IOrganizacion} organizacion Recibe IOrganizacion
     */
    post(organizacion: IOrganizacion): Observable<IOrganizacion> {
        return this.server.post(this.organizacionUrl, organizacion) // ...using post request
    }
     /**
     * Metodo put. actualiza un objeto organizacion.
     * @param {IOrganizacion} organizacion Recibe IOrganizacion
     */

    put(organizacion: IOrganizacion): Observable<IOrganizacion> {
        return this.server.put(this.organizacionUrl + "/" + organizacion.id, organizacion) // ...using post request
    }

    /**
     * Metodo disable. deshabilita organizacion.
     * @param {IEspecialidad} especialidad Recibe IEspecialidad
     */
    disable(organizacion: IOrganizacion): Observable<IOrganizacion> {
        organizacion.activo = false;
        organizacion.fechaBaja = new Date();
        return this.put(organizacion)    
    }

     /**
     * Metodo enable. habilita establecimiento.
     * @param {IOrganizacion} establecimiento Recibe IOrganizacion
     */
    enable(establecimiento: IOrganizacion): Observable<IOrganizacion> {
        establecimiento.activo = true;
        return this.put(establecimiento)
    }
}