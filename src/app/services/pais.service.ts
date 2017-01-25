import { AppSettings } from './../appSettings';
import { IPais } from './../interfaces/IPais';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class PaisService {

   private paisUrl = AppSettings.API_ENDPOINT +'/core/tm/paises';  // URL to web api

   constructor(private http: Http) {}

   get(): Observable<IPais[]> {
       return this.http.get(this.paisUrl)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

  handleError(error: any){
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }

   
}