import { AppSettings } from './../../appSettings';
import { IListaEspera } from './../../interfaces/turnos/IListaEspera';
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import { Server } from 'andes-shared/src/lib/server/server.service';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Rx';
// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ListaEsperaService {
    private listaEsperaUrl = AppSettings.API_ENDPOINT + '/modules/turnos/listaEspera';  // URL to web api

    constructor(private server: Server, private http: Http) { }
  /**
     * Metodo get. Trae el objeto organizacion.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<IListaEspera[]> {
        return this.server.get(this.listaEsperaUrl, {params: params, showError: true});
    }

    post(listaEspera: IListaEspera): Observable<IListaEspera> {
        return this.server.post(this.listaEsperaUrl, listaEspera);
    }

    getById(id: String): Observable<IListaEspera> {
        return this.server.get(this.listaEsperaUrl + '/' + id, null);
    }

    save(listaEspera: IListaEspera): Observable<IListaEspera> {
        if (listaEspera.id) {
            return this.server.put(this.listaEsperaUrl + '/' + listaEspera.id, listaEspera);
        } else {
            return this.server.post(this.listaEsperaUrl, listaEspera);
        }
    }
}
