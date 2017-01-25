import { ServerService } from 'andes-shared/src/lib/server.service';
import { AppSettings } from './../../appSettings';
import { IEspacioFisico } from './../../interfaces/turnos/IEspacioFisico';
import { Observable } from 'rxjs/Rx';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class EspacioFisicoService {
    private espacioFisicoUrl = AppSettings.API_ENDPOINT + '/modules/turnos/espacioFisico';  // URL to web api
    constructor(private server: ServerService, private http: Http) { }

    get(params: any): Observable<IEspacioFisico[]> {
        return this.server.get(this.espacioFisicoUrl, params);
    }
    // get(): Observable<IEspacioFisico[]> {
    //     return this.http.get(this.espacioFisicoUrl)
    //         .map((res: Response) => res.json())
    //         .catch(this.handleError); // ...errors if any*/
    // }

    post(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        return this.server.post(this.espacioFisicoUrl, espacioFisico) // ...using post request
    }
    // post(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
    //     let bodyString = JSON.stringify(espacioFisico); // Stringify payload
    //     console.log(bodyString);
    //     let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    //     let options = new RequestOptions({ headers: headers }); // Create a request option
    //     return this.http.post(this.espacioFisicoUrl, bodyString, options) // ...using post request
    //         .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
    //         .catch(this.handleError); // ...errors if any
    // }

    put(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        return this.server.put(this.espacioFisicoUrl + '/' + espacioFisico.id, espacioFisico) // ...using post request
    }
    // put(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
    //     let bodyString = JSON.stringify(espacioFisico); // Stringify payload
    //     let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    //     let options = new RequestOptions({ headers: headers }); // Create a request option
    //     console.log(espacioFisico);
    //     return this.http.put(this.espacioFisicoUrl + "/" + espacioFisico.id, bodyString, options) // ...using post request
    //         .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
    //         .catch(this.handleError); // ...errors if any
    // }

    disable(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        espacioFisico.activo = false;
        // espacioFisico.fechaBaja = new Date();
        return this.put(espacioFisico)    
    }

    // disable(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
    //     espacioFisico.activo = false;

    //     let bodyString = JSON.stringify(espacioFisico); // Stringify payload
    //     let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    //     let options = new RequestOptions({ headers: headers }); // Create a request option

    //     return this.http.put(this.espacioFisicoUrl + "/" + espacioFisico.id, bodyString, options) // ...using post request
    //         .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
    //         .catch(this.handleError); // ...errors if any
    // }

    // enable(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
    //     espacioFisico.activo = true;
    //     let bodyString = JSON.stringify(espacioFisico); // Stringify payload
    //     let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    //     let options = new RequestOptions({ headers: headers }); // Create a request option
    //     return this.http.put(this.espacioFisicoUrl + "/" + espacioFisico.id, bodyString, options) // ...using post request
    //         .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
    //         .catch(this.handleError); //...errors if any
    // }

    enable(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        espacioFisico.activo = true;
        return this.put(espacioFisico)
    }

    handleError(error: any) {
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }
}