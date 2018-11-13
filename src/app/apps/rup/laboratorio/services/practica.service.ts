import { IPractica } from './../interfaces/IPractica';
import { PracticaSearch } from './../interfaces/practicaSearch.interface';
import { IPracticaMatch } from './../interfaces/IPracticaMatch.inteface';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class PracticaService {
    private practicaUrl = '/modules/rup/laboratorio/practicas'; // URL API
    private practicaCodigoUrl = '/modules/rup/laboratorio/practicas/codigo/';
    constructor(private server: Server) { }


    /**
     * @param {PracticaSearch} params
     * @returns {Observable<IPracticaMatch[]>}
     * @memberof PracticaService
     */
    getMatch(params: PracticaSearch): Observable<IPracticaMatch[]> {
        return this.server.get(this.practicaUrl, { params: params, showError: true }).map((value) => {
            return value;
        });
    }

    getCodigosPracticas(ids) {
        return this.server.get(this.practicaUrl + '?ids=' + ids + '&fields=codigo', null).map((value) => {
            return value;
        });
    }

    getMatchCodigo(codigo: PracticaSearch): Observable<IPracticaMatch[]> {
        return this.server.get(this.practicaCodigoUrl + codigo, null).map((value) => {
            return value;
        });
    }

    findByIds(ids): Observable<IPracticaMatch[]> {
        // return this.server.get(this.practicaUrl, { params: params, showError: true }).map((value) => {
        //     return value;
        // });
        return this.server.get(this.practicaUrl + '?ids=' + ids, null).map((value) => {
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
