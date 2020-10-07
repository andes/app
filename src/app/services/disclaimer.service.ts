import { Injectable } from '@angular/core';
import { cacheStorage, Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { IDisclaimer } from '../interfaces/IDisclaimer';

@Injectable()
export class DisclaimerService {
    private url = '/core/tm/disclaimer';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Obtiene los datos de la obra social asociada a un paciente
     *
     * @param {*} version, periodo
     * @returns {Observable<IDisclaimer>}
     */

    get(opciones: any, showError = true): Observable<IDisclaimer[]> {
        return this.server.get(this.url, { params: opciones, showError: showError });
    }

    getActivos() {
        return this.get({ activo: true }).pipe(
            cacheStorage('disclaimers')
        );
    }
}
