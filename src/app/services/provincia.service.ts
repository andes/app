import { AppSettings } from './../appSettings';
import { IProvincia } from './../interfaces/IProvincia';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Server} from 'andes-shared/src/lib/server/server.service';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ProvinciaService {

   private provinciaUrl = AppSettings.API_ENDPOINT + '/core/tm/provincias';  // URL to web api

   constructor(private server: Server, private http: Http) {}

//    get(): Observable<IProvincia[]> {
//        return this.http.get(this.provinciaUrl)
//            .map((res:Response) => res.json())
//            .catch(this.handleError); //...errors if any*/
//    }

   get(params: any): Observable<IProvincia[]> {
        return this.server.get(this.provinciaUrl, params);
   }

//    getXPais(pais: String): Observable<IProvincia[]> {
//        return this.http.get(this.provinciaUrl +"?pais=" + pais)
//            .map((res:Response) => res.json())
//            .catch(this.handleError); //...errors if any*/
//    }

//     getLocalidades(provincia: String): Observable<IProvincia> {
//     console.log(this.provinciaUrl +"?nombre=" + provincia);
//        return this.http.get(this.provinciaUrl +"?nombre=" + provincia)
//            .map((res:Response) => res.json())
//            .catch(this.handleError); //...errors if any*/
//    }

//    handleError(error: any){
//         console.log(error.json());
//         return Observable.throw(error.json().error || 'Server error');
//     }

   
}