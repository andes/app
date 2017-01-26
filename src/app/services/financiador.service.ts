import { AppSettings } from './../appSettings';
import { IFinanciador } from './../interfaces/IFinanciador';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class FinanciadorService {

   private financiadorUrl = AppSettings.API_ENDPOINT + '/core/tm/financiadores';  // URL to web api

   constructor(private http: Http) {}

   get(): Observable<IFinanciador[]> {
       return this.http.get(this.financiadorUrl)
           .map((res:Response) => res.json())
           .catch(this.handleError); //...errors if any*/
   }

  handleError(error: any){
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }


}
