import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Server } from '@andes/shared';

@Injectable()
export class VacunasService {

    private vacunasURL = '/modules/vacunas';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Metodo get. Trae el objeto tipoPrestacion.
     * @param {any} params Opciones de busqueda
     */
    get(idPaciente: String): Observable<any> {
        return this.server.get(this.vacunasURL + '/paciente/' + idPaciente, null);
    }
}
