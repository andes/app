import { Observable } from 'rxjs/Rx';
import { ILog } from './../interfaces/ILog';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';

@Injectable()
export class LogService {

    private logUrl = '/core/log/operaciones';  // URL to web api

    constructor(private server: Server) { }

    get(modulo: any, params: any): Observable<any> {
        return this.server.get(this.logUrl + '/' + modulo, { params: params, showError: true });
    }

    post(modulo: any, operacion: any, data: any): Observable<any> {
        return this.server.post(this.logUrl + '/' + modulo + '/' + operacion, { data, showError: true });
    }

}

