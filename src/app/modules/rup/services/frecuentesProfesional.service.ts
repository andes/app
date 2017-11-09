import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Server } from '@andes/shared';
import { SemanticTag } from '../interfaces/semantic-tag.type';
import { ISnomedConcept } from './../interfaces/snomed-concept.interface';
import { IFrecuentesProfesional } from './../interfaces/frecuentesProfesional.interface.';

const url = '/modules/rup/frecuentesProfesional';

@Injectable()
export class FrecuentesProfesionalService {

    constructor(private server: Server) { }

    /**
     * Metodo getById. Trae el objeto elementoRup por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<IFrecuentesProfesional> {
        return this.server.get(url + '/' + id);
    }

    /**
     * Metodo post. Inserta un objeto elementoRup nuevo.
     * @param {IFrecuentesProfesional} elementoRup Recibe IFrecuentesProfesional
     */
    post(elementoRup: IFrecuentesProfesional): Observable<IFrecuentesProfesional> {
        return this.server.post(url, elementoRup);
    }

    updateFrecuentes(id: String, registros: any): Observable<any> {
        return this.server.put(url + '/' + id, registros);
    }
}
