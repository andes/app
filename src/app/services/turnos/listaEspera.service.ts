import { IListaEspera } from './../../interfaces/turnos/IListaEspera';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';

@Injectable()
export class ListaEsperaService {

    private listaEsperaUrl = '/modules/turnos/listaEspera';  // URL to web api

    constructor(private server: Server) { }

    /**
       * Metodo get. Trae el objeto organizacion.
       * @param {any} params Opciones de busqueda
       */
    get(params: any): Observable<IListaEspera[]> {
        return this.server.get(this.listaEsperaUrl, { params: params, showError: true });
    }

    post(listaEspera: IListaEspera): Observable<IListaEspera> {
        return this.server.post(this.listaEsperaUrl, listaEspera);
    }

    postXIdAgenda(id: String, cambios: any): Observable<IListaEspera> {
        return this.server.post(this.listaEsperaUrl + '/IdAgenda/' + id, cambios);
    }

    getById(id: String): Observable<IListaEspera> {
        return this.server.get(this.listaEsperaUrl + '/' + id, null);
    }

    patch(id: String, cambios: any): Observable<IListaEspera> {
        return this.server.patch(this.listaEsperaUrl + '/' + id, cambios);
    }

    save(listaEspera: IListaEspera): Observable<IListaEspera> {
        if (listaEspera.id) {
            return this.server.put(this.listaEsperaUrl + '/' + listaEspera.id, listaEspera);
        } else {
            return this.server.post(this.listaEsperaUrl, listaEspera);
        }
    }
}
