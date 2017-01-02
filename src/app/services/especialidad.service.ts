import { AppSettings } from './../appSettings';
import { IEspecialidad } from './../interfaces/IEspecialidad';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class EspecialidadService {

   private especialidadUrl = AppSettings.API_ENDPOINT +'/especialidad';  // URL to web api

   constructor(private http: Http) {}

    get(): Observable<IEspecialidad[]> {
       return this.http.get(this.especialidadUrl)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

   getByTerm(codigoSisa:String, nombre: String): Observable<IEspecialidad[]> {
       console.log(codigoSisa);
       return this.http.get(this.especialidadUrl+"?codigoSisa=" + codigoSisa + "&nombre=" + nombre)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

   post(especialidad: IEspecialidad): Observable<IEspecialidad> {
        let bodyString = JSON.stringify(especialidad); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post(this.especialidadUrl, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 

    put(especialidad: IEspecialidad): Observable<IEspecialidad> {
        debugger;
        let bodyString = JSON.stringify(especialidad); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        console.log(especialidad.id);
         console.log(bodyString);
        return this.http.put(this.especialidadUrl + "/" + especialidad.id, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 

     disable(especialidad: IEspecialidad): Observable<IEspecialidad> {
        especialidad.habilitado = false;
        especialidad.fechaBaja = new Date();
        let bodyString = JSON.stringify(especialidad); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.especialidadUrl + "/" + especialidad.id, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 

    enable(especialidad: IEspecialidad): Observable<IEspecialidad> {
        especialidad.habilitado = true;
        let bodyString = JSON.stringify(especialidad); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.especialidadUrl + "/" + especialidad.id, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 

     handleError(error: any){
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }


   
}