import { Server } from '@andes/shared';
import { AppSettings } from './../../appSettings';
import { IEspacioFisico } from './../../interfaces/turnos/IEspacioFisico';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class EspacioFisicoService {
    private espacioFisicoUrl = AppSettings.API_ENDPOINT + '/modules/turnos/espacioFisico';  // URL to web api
    constructor(private server: Server, private http: Http) { }

    get(params: any): Observable<IEspacioFisico[]> {
        console.log('aca ', params);
        return this.server.get(this.espacioFisicoUrl, {params: params, showError: true});
    }

    post(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        return this.server.post(this.espacioFisicoUrl, espacioFisico);
    }

    put(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        return this.server.put(this.espacioFisicoUrl + '/' + espacioFisico.id, espacioFisico);
    }

    disable(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        espacioFisico.activo = false;
        return this.put(espacioFisico);
    }

    enable(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        espacioFisico.activo = true;
        return this.put(espacioFisico);
    }

    handleError(error: any) {
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }
}
