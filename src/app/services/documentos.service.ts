import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { Slug } from 'ng2-slugify';
import { tap } from 'rxjs/internal/operators/tap';


@Injectable()
export class DocumentosService {

    // URL to web api
    private pdfURL = environment.API + '/modules/descargas';
    // Usa el keymap 'default'
    private slug = new Slug('default');

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

    descargarArchivo(informe, nombreArchivo: string, headers: any): Observable<any> {
        return this.descargarV2(informe).pipe(tap(data => {
            if (data) {
                // Generar descarga como PDF
                let blob = new Blob([data], headers);
                saveAs(blob, this.slug.slugify(`${nombreArchivo} - ${moment().format('DD-MM-YYYY-hmmss')}.pdf`));

            } else {
                // Fallback a impresión normal desde el navegador
                window.print();
            }
        }));
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        return Observable.throw(errMsg);
    }

    protected extractData(res: any) {
        return res.blob();
    }

    descargarConstanciaPuco(params): Observable<any> {
        return this.download('constanciaPuco/pdf', params);
    }

    descargarCenso(data): Observable<any> {
        return this.download('censo', data);
    }

    descargarReporteInternaciones(params): Observable<any> {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': window.sessionStorage.getItem('jwt') ? 'JWT ' + window.sessionStorage.getItem('jwt') : null
        });

        let options: any = { headers: headers, responseType: 'blob', params };
        return this.http.get(`${environment.API}/bi/queries/listado-internacion/csv`, options);
    }
}
