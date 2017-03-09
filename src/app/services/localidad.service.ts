import { AppSettings } from './../appSettings';
import { ILocalidad } from './../interfaces/ILocalidad';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Server } from '@andes/shared';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class LocalidadService {

    private localidadUrl = AppSettings.API_ENDPOINT + '/core/tm/localidades';  // URL to web api

    constructor(private server: Server, private http: Http) { }

    get(params: any): Observable<ILocalidad[]> {
        return this.server.get(this.localidadUrl, {params: params, showError: true});
    }

    getXProvincia(provincia: String): Observable<ILocalidad[]> {
        console.log(this.localidadUrl + '?pronvicia=' + provincia);
        return this.http.get(this.localidadUrl + '?pronvicia=' + provincia)
            .map((res: Response) => res.json())
            .catch(this.handleError); // ...errors if any*/
    }

    handleError(error: any) {
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }
}
