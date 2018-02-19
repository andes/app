import { ITipoPrestacion } from './../interfaces/ITipoPrestacion';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { Server } from '@andes/shared';

@Injectable()
export class TipoPrestacionService {

    private tipoPrestacionUrl = '/core/tm/v2/tipoPrestaciones';  // URL to web api
    // private tipoPrestacionUrl = '/core/term/snomed';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Metodo get. Trae el objeto tipoPrestacion.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<ITipoPrestacion[]> {
        // params['refsetId'] = '1661000013109';
        return this.server.get(this.tipoPrestacionUrl, { params: params, showError: true }).map(conceptos => {
            let salida = [];
            let preferido;
            conceptos.forEach(element => {
                preferido = conceptos.find(x => x.conceptId === element.conceptId && x.acceptability.conceptId === '900000000000548007');
                salida.push({
                    id: element.conceptId,
                    conceptId: element.conceptId,
                    term: element.term,
                    fsn: element.fsn,
                    semanticTag: element.semanticTag,
                    nombre: element.term,
                    acceptability: element.acceptability,
                    // nombrePreferido: (element.acceptability && element.acceptability.conceptId && element.acceptability.conceptId === '900000000000548007') ? '' : '(' + preferido.term + ')'
                    preferido: preferido.term !== element.term ? '(' + preferido.term + ' ★)' : '★'
                });
            });

            // const groupedObj = salida.reduce((prev, cur) => {
            //     if (!prev[String(cur.conceptId)]) {
            //         prev[String(cur.conceptId)] = [cur];
            //     } else {
            //         prev[String(cur.conceptId)].push(cur);
            //     }
            //     return prev;
            // }, {});

            // salida = Object.keys(groupedObj)
            //     .map(c => {
            //         return groupedObj[c]
            //     }).reverse();


            // salida.sort((a, b) => {
            //     if (b.id === a.id) {
            //         if (a.acceptability.conceptId === '900000000000548007') {
            //             return -1;
            //         }
            //         if (b.acceptability.conceptId === '900000000000548007') {
            //             return 1;
            //         }
            //     } else {
            //         return 0;
            //     }
            // })


            return salida;
        });

        // return this.server.get(this.tipoPrestacionUrl, { params: params, showError: true });
    }
    /**
     * Metodo getById. Trae el objeto tipoPrestacion por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<ITipoPrestacion> {
        return this.server.get(this.tipoPrestacionUrl + '/' + id, null);
    }
    /**
     * Metodo post. Inserta un objeto tipoPrestacion nuevo.
     * @param {ITipoPrestacion} tipoPrestacion Recibe ITipoPrestacion
     */
    post(tipoPrestacion: ITipoPrestacion): Observable<ITipoPrestacion> {
        return this.server.post(this.tipoPrestacionUrl, tipoPrestacion);
    }
    /**
     * Metodo put. Actualiza un objeto tipoPrestacion nuevo.
     * @param {ITipoPrestacion} tipoPrestacion Recibe ITipoPrestacion
     */
    put(tipoPrestacion: ITipoPrestacion): Observable<ITipoPrestacion> {
        return this.server.put(this.tipoPrestacionUrl + '/' + tipoPrestacion.id, tipoPrestacion);
    }
    /**
     * Metodo disable. deshabilita tipoPrestacion.
     * @param {ITipoPrestacion} tipoPrestacion Recibe ITipoPrestacion
     */
    disable(tipoPrestacion: ITipoPrestacion): Observable<ITipoPrestacion> {
        return this.put(tipoPrestacion);
    }
    /**
     * Metodo enable. habilita tipoPrestacion.
     * @param {ITipoPrestacion} tipoPrestacion Recibe ITipoPrestacion
     */
    enable(tipoPrestacion: ITipoPrestacion): Observable<ITipoPrestacion> {
        return this.put(tipoPrestacion);
    }

    searchPreferido(concept: ITipoPrestacion, prestaciones: ITipoPrestacion[]) {
        let data = prestaciones.filter(item => {
            return item.conceptId === concept.conceptId && item.acceptability.conceptId === '900000000000548007';
        });
        return data.length > 0 ? data[0] : null;
    }
}
