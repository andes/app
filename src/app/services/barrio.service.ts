import { AppSettings } from './../appSettings';
import { IBarrio } from './../interfaces/IBarrio';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class BarrioService {

   private barrioUrl = AppSettings.API_ENDPOINT + '/barrio';  // URL to web api

   constructor(private http: Http) {}

   get(): Observable<IBarrio[]> {
       return this.http.get(this.barrioUrl)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

    getXProvincia(localidad: String): Observable<IBarrio[]> {
    console.log(this.barrioUrl +"?localidad=" + localidad);
       return this.http.get(this.barrioUrl +"?localidad=" + localidad)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

  handleError(error: any){
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }

   
}