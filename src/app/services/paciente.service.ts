import { AppSettings } from './../appSettings';
import { IPaciente } from './../interfaces/IPaciente';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class PacienteService {

   private pacienteUrl = AppSettings.API_ENDPOINT +'/paciente';  // URL to web api
   private pacienteUrlSearch = AppSettings.API_ENDPOINT +'/paciente/search';  // URL to web api
   constructor(private http: Http) {}

   get(): Observable<IPaciente[]> {
       return this.http.get(this.pacienteUrl)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

   post(paciente: IPaciente): Observable<IPaciente> {
        let bodyString = JSON.stringify(paciente); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.post(this.pacienteUrl, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 

    postSearch(dto:any): Observable<IPaciente[]>{
        let bodyString = {"objetoBusqueda":dto}
        let headers      = new Headers({ 'Content-Type': 'application/json' });
        let options       = new RequestOptions({headers:headers});
        let pacientes;
        return this.http.post(this.pacienteUrlSearch, bodyString,options) 
                         .map((res:Response) => {pacientes = res.json(); return pacientes}) 
                         .catch(this.handleError); 
    }

    getBySerch(apellido:string, nombre: string, documento: string, estado: string, fechaNac: Date, sexo: string): Observable<IPaciente[]> {
       debugger;
       return this.http.get(this.pacienteUrl+"?apellido=" + apellido + "&nombre=" + nombre+ "&documento=" + documento+
                           "&estado=" + estado + "&fechaNac=" + fechaNac + "&sexo=" + sexo)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

   disable(paciente: IPaciente): Observable<IPaciente> {
         paciente.activo = false;
         
        let bodyString = JSON.stringify(paciente); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.pacienteUrl + "/" + paciente.id, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 

    enable(paciente: IPaciente): Observable<IPaciente> {
         paciente.activo = true;
        let bodyString = JSON.stringify(paciente); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.pacienteUrl + "/" + paciente.id, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 

    put(paciente: IPaciente): Observable<IPaciente> {
        let bodyString = JSON.stringify(paciente); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.pacienteUrl + "/" + paciente.id, bodyString, options) // ...using post request
                         .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
                         .catch(this.handleError); //...errors if any
    } 
   
     handleError(error: any){
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }

   
}