
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Http, ResponseContentType, RequestMethod } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { environment } from '../../../../../environments/environment';

@Injectable()
export class ReportesLaboratorioService {
    private reportesUrl = environment.API + '/modules/rup/laboratorio/reportes/';

    constructor(private http: Http) { }

    /**
     * @param {PracticaSearch} params
     * @returns {Observable<IPracticaMatch[]>}
     * @memberof PracticaService
     */
    reporteResultados(protocolos) {
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': window.sessionStorage.getItem('jwt') ? 'JWT ' + window.sessionStorage.getItem('jwt') : null
        });
        let options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob, method: RequestMethod.Post });

        return this.http.post(this.reportesUrl + 'resultados/', protocolos, options)
            .map(res => res.blob())
            .catch(this.handleError);
    }

    /**
     *
     *
     * @private
     * @param {*} error
     * @returns
     * @memberof ReportesLaboratorioService
     */
    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        return Observable.throw(errMsg);
    }
}
