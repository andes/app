
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class DocumentosService {

    // URL to web api
    private pdfURL = environment.API + '/modules/descargas';

    constructor(private http: HttpClient) { }

    download(url, data): Observable<any> {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': window.sessionStorage.getItem('jwt') ? 'JWT ' + window.sessionStorage.getItem('jwt') : ''
        });

        let options: any = { headers: headers, responseType: 'blob' };
        return this.http.post(this.pdfURL + '/' + url, data, options).pipe(
            catchError(this.handleError)
        );
    }


    descargar(data): Observable<any> {
        return this.download('censoMensual', data);
    }


    descargarV2(data): Observable<any> {
        return this.download('pdf', data);
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        return Observable.throw(errMsg);
    }

    descargarConstanciaPuco(params): Observable<any> {
        return this.download('constanciaPuco/pdf', params);
    }

    descargarCenso(data): Observable<any> {
        return this.download('censo', data);
    }


}
