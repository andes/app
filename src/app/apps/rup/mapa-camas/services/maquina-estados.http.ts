import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { IMaquinaEstados } from '../interfaces/IMaquinaEstados';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class MaquinaEstadosHTTP {
    private url = '/modules/rup/internacion';

    constructor(
        private server: Server
    ) { }

    get(ambito: string, capa: string, organizacion: string): Observable<IMaquinaEstados[]> {
        return this.server.get(`${this.url}/estados`, {
            params: { organizacion, ambito, capa },
            showError: true
        });
    }

    getOne(ambito: string, capa: string, organizacion: string) {
        return this.get(ambito, capa, organizacion).pipe(
            map(maquinaEstados => {
                if (maquinaEstados && maquinaEstados.length > 0) {
                    return maquinaEstados[0];
                }
                throwError('NO HAY MAQUINA DE ESTADO');
            })
        );
    }


}
