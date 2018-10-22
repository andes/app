
import {throwError as observableThrowError} from 'rxjs';

import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Rx';


import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';
import { Http, Response, ResponseContentType, RequestMethod } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class DocumentosService {

    // URL to web api
    private pdfURL = environment.API + '/modules/descargas';

    constructor(private http: Http) { }

    /**
     * @param html HTML que se envía a la API para que genere y devuelva un PDF "institucionalizado"
     */
    descargar(html: string): Observable<any> {

        let htmlPdf = { html: Buffer.from(html).toString('base64') };
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': window.sessionStorage.getItem('jwt') ? 'JWT ' + window.sessionStorage.getItem('jwt') : null
        });

        let options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob, method: RequestMethod.Post });
        return this.http.post(this.pdfURL + '/pdf', { html: Buffer.from(html).toString('base64'), options: { format: 'A4' } }, options).pipe(
            map(this.extractData),
            catchError(this.handleError));
    }

    descargarV2(data): Observable<any> {

        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': window.sessionStorage.getItem('jwt') ? 'JWT ' + window.sessionStorage.getItem('jwt') : null
        });

        let options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob, method: RequestMethod.Post });
        return this.http.post(this.pdfURL + '/pdf', data, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return observableThrowError(errMsg);
    }
    protected extractData(res: Response) {
        return res.blob();
    }

}
