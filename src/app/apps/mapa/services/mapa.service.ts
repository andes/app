import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { IMapa } from '../interfaces/IMapa';
import { Observable } from 'rxjs/Rx';


@Injectable()
export class MapaService {

    private mapaUrl = '/core/status/mapa'; // URL to web api
    constructor(private server: Server) { }


    /**
   * Metodo get. Trae el objeto mapa.
   * @param {any} params Opciones de busqueda
   */
    get(): Observable<IMapa[]> {
        return this.server.get(this.mapaUrl);
    }
}
