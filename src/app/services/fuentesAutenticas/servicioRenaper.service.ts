import * as https from 'https';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class RenaperService {

    private url = '/modules/fuentesAutenticas';  // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<any> {
        return this.server.get(this.url + '/renaper', { params: params, showError: false });
    }

}
