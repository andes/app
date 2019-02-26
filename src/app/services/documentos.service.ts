
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, Response, ResponseContentType, RequestMethod } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class DocumentosService {

    // URL to web api
    private pdfURL = environment.API + '/modules/descargas';

    constructor(private http: Http) { }

    descargar(html: string, scssFile = null, horizontal = false): Observable<any> {

        let htmlPdf = { html: Buffer.from(html).toString('base64') };
        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': window.sessionStorage.getItem('jwt') ? 'JWT ' + window.sessionStorage.getItem('jwt') : null
        });

        let options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob, method: RequestMethod.Post });

        let opcionesImprimir: any = { html: Buffer.from(html).toString('base64'), options: { format: 'A4' }, horizontal: horizontal };
        if (scssFile) {
            opcionesImprimir = { ...opcionesImprimir, scssFile: scssFile };
        }
        return this.http.post(this.pdfURL + '/pdf', opcionesImprimir, options)
            .map(this.extractData)
            .catch(this.handleError);
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
        return Observable.throw(errMsg);
    }
    protected extractData(res: Response) {
        return res.blob();
    }

    descargarConstanciaPuco(params): Observable<any> {
        let headers = new Headers({
            'Content-Type': 'application/json',
        });
        let options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob, method: RequestMethod.Post });

        return this.http.post(this.pdfURL + '/constanciaPuco/pdf', params, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    descargarCenso(data): Observable<any> {

        let headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': window.sessionStorage.getItem('jwt') ? 'JWT ' + window.sessionStorage.getItem('jwt') : null
        });

        let options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob, method: RequestMethod.Post });
        return this.http.post(this.pdfURL + '/censo', data, options)
            .map(this.extractData)
            .catch(this.handleError);
    }


}
