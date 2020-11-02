import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { Server } from '@andes/shared';
import { SemanticTag } from '../interfaces/semantic-tag.type';
import { ISnomedConcept } from './../interfaces/snomed-concept.interface';
import { IFrecuentesProfesional } from '../interfaces/frecuentesProfesional.interface';

const url = '/modules/rup/frecuentesProfesional';
const urlPrestacion = '/modules/rup/frecuentesPrestacion';

@Injectable()
export class FrecuentesProfesionalService {

    constructor(private server: Server) { }


    /**
     * Metodo get. Trae lista de elementosRup más frecuentes.
     *
     * @param {*} params Opciones de busqueda
     * @param {*} [options={}] Options a pasar a la API
     * @returns {Observable<IPrestacion[]>}
     *
     * @memberof PrestacionesService
     */
    get(params: any, options: any = {}): Observable<IFrecuentesProfesional[]> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        let opt = { params: params, options };
        return this.server.get(url, opt);
    }

}
