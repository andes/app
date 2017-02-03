import { AppSettings } from './../../appSettings';
import { Http } from '@angular/http';
import { IListaEspera } from './../../interfaces/turnos/IListaEspera';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from 'andes-shared/src/lib/server/server.service';

@Injectable()
export class ListaEsperaService {
    private listaEsperaUrl = AppSettings.API_ENDPOINT + '/modules/turnos/listaEspera';  // URL to web api

    constructor(private server: Server, private http: Http) { }

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
