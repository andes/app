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

    private organizacionUrl = AppSettings.API_ENDPOINT + '/organizacion';  // URL to web api

    constructor(private server: ServerService, private http: Http) { }

    get(params: any): Observable<IOrganizacion[]> {
        return this.server.get(this.organizacionUrl, params);
    }

    getById(id: String): Observable<IOrganizacion> {
        return this.server.get(this.organizacionUrl + "/" + id, null);
    }

    post(organizacion: IOrganizacion): Observable<IOrganizacion> {
        let bodyString = JSON.stringify(organizacion); // Stringify payload
        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post(this.organizacionUrl, bodyString, options) // ...using post request
            .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    }

    put(organizacion: IOrganizacion): Observable<IOrganizacion> {
        let bodyString = JSON.stringify(organizacion); // Stringify payload
        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        //console.log(bodyString);
        return this.http.put(this.organizacionUrl + "/" + organizacion.id, bodyString, options) // ...using post request
            .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    }

    disable(organizacion: IOrganizacion): Observable<IOrganizacion> {
        organizacion.activo = false;
        organizacion.fechaBaja = new Date();
        console.log(organizacion.fechaBaja);
        let bodyString = JSON.stringify(organizacion); // Stringify payload
        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.organizacionUrl + "/" + organizacion.id, bodyString, options) // ...using post request
            .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    }

    enable(establecimiento: IOrganizacion): Observable<IOrganizacion> {
        establecimiento.activo = true;
        let bodyString = JSON.stringify(establecimiento); // Stringify payload
        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.organizacionUrl + "/" + establecimiento.id, bodyString, options) // ...using post request
            .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    }

    handleError(error: any) {
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }

}