import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch'
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

    descargar(html: string): Observable<any> {

        let htmlPdf = { html: Buffer.from(html).toString('base64') };
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': window.sessionStorage.getItem('jwt') ? 'JWT ' + window.sessionStorage.getItem('jwt') : null
        });

        let options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob, method: RequestMethod.Post });
        return this.http.post(this.pdfURL + '/pdf', { html: Buffer.from(html).toString('base64'), options: { format: 'A4' } }, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
    protected extractData(res: Response) {
        return res.blob();
    }

}
