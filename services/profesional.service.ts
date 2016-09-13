import { IProfesional } from './../interfaces/IProfesional';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ProfesionalService {

   private profesionalUrl = 'http://localhost:3002/api/profesional';  // URL to web api

   constructor(private http: Http) {}

   get(): Observable<IProfesional[]> {
       return this.http.get(this.profesionalUrl)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

   post(profesional: IProfesional): Observable<IProfesional> {
        let bodyString = JSON.stringify(profesional); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post(this.profesionalUrl, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 

    getByTerm(apellido:string, nombre: String): Observable<IProfesional[]> {
       return this.http.get(this.profesionalUrl+"?apellido=" + apellido + "&nombre=" + nombre)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }
   
     handleError(error: any){
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }

   
}