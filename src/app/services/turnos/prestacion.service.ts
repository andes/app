import { IPrestacion } from './../../interfaces/turnos/IPrestacion';
import { Observable } from 'rxjs/Rx';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class PrestacionService {
    private prestacionUrl = 'http://localhost:3002/api/turnos/prestacion';  // URL to web api
    constructor(private http: Http) { }

    get(): Observable<IPrestacion[]> {
        return this.http.get(this.prestacionUrl)
            .map((res: Response) => res.json())
            .catch(this.handleError);

    }
    
    post(prestacion: IPrestacion): Observable<IPrestacion> {

        let bodyString = JSON.stringify(prestacion);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers }); // Create a request option

        return this.http.post(this.prestacionUrl, bodyString, options) // ...using post request
            .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    }

    put(prestacion: IPrestacion): Observable<IPrestacion> {

        let bodyString = JSON.stringify(prestacion); // Stringify payload
        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option

        return this.http.put(this.prestacionUrl + "/" + prestacion.id, bodyString, options) // ...using post request
            .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    }

    disable(prestacion: IPrestacion): Observable<IPrestacion> {
        prestacion.activo = false;

        let bodyString = JSON.stringify(prestacion); // Stringify payload
        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option

        return this.http.put(this.prestacionUrl + "/" + prestacion.id, bodyString, options) // ...using post request
            .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    }

    enable(prestacion: IPrestacion): Observable<IPrestacion> {
        prestacion.activo = true;

        let bodyString = JSON.stringify(prestacion); // Stringify payload
        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option

        return this.http.put(this.prestacionUrl + "/" + prestacion.id, bodyString, options) // ...using post request
            .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    }

    handleError(error: any) {
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }
}