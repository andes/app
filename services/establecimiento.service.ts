import { IEstablecimiento } from './../interfaces/IEstablecimiento';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class EstablecimientoService {

   private establecimientoUrl = 'http://localhost:3002/api/establecimiento';  // URL to web api

   constructor(private http: Http) { }

   getEstablecimiento(): Promise<IEstablecimiento[]> {
       return this.http.get(this.establecimientoUrl)
           .toPromise()
           .then(response => response.json())
           .catch(this.handleError);
   }



   postEstablecimiento (establecimiento: IEstablecimiento): Observable<IEstablecimiento> {
        let bodyString = JSON.stringify(establecimiento); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        debugger;
        return this.http.post(this.establecimientoUrl, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch((error:any) => Observable.throw(error.json().error || 'Server error')); //...errors if any
    } 

    private handleError(error: any) {
       return Promise.reject(error.message || error);
   }

}