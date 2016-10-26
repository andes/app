import { AppSettings } from './../appSettings';
import { ILocalidad } from './../interfaces/ILocalidad';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class LocalidadService {

   private localidadUrl = AppSettings.API_ENDPOINT + '/localidad';  // URL to web api

   constructor(private http: Http) {}

   get(): Observable<ILocalidad[]> {
       return this.http.get(this.localidadUrl)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

    getXProvincia(provincia: String): Observable<ILocalidad[]> {
    console.log(this.localidadUrl +"?pronvicia=" + provincia);
       return this.http.get(this.localidadUrl +"?pronvicia=" + provincia)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

  handleError(error: any){
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }

   
}