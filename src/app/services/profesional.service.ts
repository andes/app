import { AppSettings } from './../appSettings';
import { IProfesional } from './../interfaces/IProfesional';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import { Server } from '@andes/shared';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ProfesionalService {

    private profesionalUrl = AppSettings.API_ENDPOINT + '/core/tm/profesionales';  // URL to web api

    constructor(private server: Server, private http: Http) { }

    /**
     * Metodo get. Trae el objeto organizacion.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<IProfesional[]> {
        return this.server.get(this.profesionalUrl, {params: params, showError: true});
    }
    /**
     * Metodo post. Inserta un objeto organizacion nuevo.
     * @param {IOrganizacion} organizacion Recibe IOrganizacion
     */
    post(organizacion: IProfesional): Observable<IProfesional> {
        return this.server.post(this.profesionalUrl, organizacion); // ...using post request
    }

    disable(profesional: IProfesional): Observable<IProfesional> {
        profesional.activo = false;

        let bodyString = JSON.stringify(profesional); // Stringify payload
        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.profesionalUrl + "/" + profesional.id, bodyString, options) // ...using post request
            .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    }

    enable(profesional: IProfesional): Observable<IProfesional> {
        profesional.activo = true;
        let bodyString = JSON.stringify(profesional); // Stringify payload
        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.profesionalUrl + "/" + profesional.id, bodyString, options) // ...using post request
            .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    }

    put(profesional: IProfesional): Observable<IProfesional> {
        let bodyString = JSON.stringify(profesional); // Stringify payload
        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.profesionalUrl + "/" + profesional.id, bodyString, options) // ...using post request
            .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    }

    handleError(error: any) {
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }
}