import { IPractica } from './../../interfaces/laboratorio/IPractica';
import { Observable } from 'rxjs/Rx';
import { PracticaSearch } from './practicaSearch.interface';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { IPracticaMatch } from '../../components/laboratorio/interfaces/IPracticaMatch.inteface';

@Injectable()
export class PracticaService {
    private practicaUrl = '/modules/rup/laboratorio/practicas'; // URL API
    constructor(private server: Server) { }


    /**
     * TEMPORAL.
     * @param {PracticaSearch} params
     * @returns {Observable<IPracticaMatch[]>}
     * @memberof PracticaService
     */
    getMatch(params: PracticaSearch): Observable<IPracticaMatch[]> {
        return this.server.get(this.practicaUrl, { params: params, showError: true }).map((value) => {
            return value;

        });
    }
    disable(practica: IPractica): Observable<IPractica> {
        practica.activo = false;
        return this.put(practica);
    }

    /**
     * Metodo enable. habilita un objeto practica..
     * @param {IPractica} practica Recibe IPractica
     */
    enable(practica: IPractica): Observable<IPractica> {
        practica.activo = true;
        return this.put(practica);
    }

    save(practica: IPractica): Observable<IPractica> {
        if (practica.id) {
            return this.server.put(this.practicaUrl + '/' + practica.id, practica);
        } else {
            return this.server.post(this.practicaUrl, practica);

        }
    }
    post(practica: IPractica): Observable<IPractica> {
        return this.server.post(this.practicaUrl, practica);
    }

    /**
     * Metodo put. Actualiza un objeto practica.
     * @param {IPractica} practica Recibe IPractica
     */
    put(practica: IPractica): Observable<IPractica> {
        return this.server.put(this.practicaUrl + '/' + practica.id, practica);
    }

}
