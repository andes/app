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

   constructor(private http: Http) {}

   get(): Observable<IEstablecimiento[]> {
       return this.http.get(this.establecimientoUrl)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

   getByTerm(codigoSisa:string, nombre: String): Observable<IEstablecimiento[]> {
       return this.http.get(this.establecimientoUrl+"?codigoSisa=" + codigoSisa + "&nombre=" + nombre)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

   post(establecimiento: IEstablecimiento): Observable<IEstablecimiento> {
        let bodyString = JSON.stringify(establecimiento); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post(this.establecimientoUrl, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 

     disable(establecimiento: IEstablecimiento): Observable<IEstablecimiento> {
         establecimiento.habilitado = false;
         establecimiento.fechaBaja = new Date();
         console.log(establecimiento.fechaBaja);
        let bodyString = JSON.stringify(establecimiento); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.establecimientoUrl + "/" + establecimiento._id, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 

     handleError(error: any){
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }

   
}