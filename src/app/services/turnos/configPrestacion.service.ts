import { IConfigPrestacion } from './../../interfaces/turnos/IConfigPrestacion';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ConfigPrestacionService {

    private prestacionUrl = 'http://localhost:3002/api/turnos/prestacion';  // URL to web api
    private configPrestacionUrl = 'http://localhost:3002/api/turnos/configPrestacion';
    constructor(private http: Http) { 
    }

    get(query: string): Observable<any[]> {
        console.log("Buscar prestaciones que contengan: ", query);
        return this.http.get(this.prestacionUrl)
            .map((res: Response) => res.json())
            .catch(this.handleError); //...errors if any*/
    }

    getConfig(): Observable<any[]> {
        return this.http.get(this.configPrestacionUrl)
            .map((res: Response) => res.json())
            .catch(this.handleError); //...errors if any*/
    }

    post(prestacion: IConfigPrestacion): Observable<IConfigPrestacion> {
        let bodyString = JSON.stringify(prestacion); // Stringify payload
        console.log(bodyString);
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post(this.configPrestacionUrl, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 
    
    handleError(error: any) {
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }
}