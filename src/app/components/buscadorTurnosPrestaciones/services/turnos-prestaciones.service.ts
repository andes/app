import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Server } from '@andes/shared';
import { ITurnosPrestaciones } from '../interfaces/turnos-prestaciones.interface';

@Injectable()
export class TurnosPrestacionesService {

    private turnosPrestacionesURL = '/modules/estadistica/turnos_prestaciones';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Metodo get.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<ITurnosPrestaciones[]> {
        return this.server.get(this.turnosPrestacionesURL, { params: params, showError: true });
    }
}
