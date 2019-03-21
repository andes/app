import { ILoteDerivacion } from './../interfaces/practica/ILoteDerivacion';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class LoteDerivacionService {
    private url = '/modules/rup/laboratorio/lotesDerivaciones/'; // URL API
    constructor(private server: Server) { }

    get(params, area?) {
        // let params: any = { laboratorioOrigen: laboratorioOrigen };
        // if (area) {
        //     params.area = area;
        // }

        return this.server.get(this.url, { params: params, showError: true });
    }

    post(loteDerivacion: ILoteDerivacion): Observable<ILoteDerivacion> {
        return this.server.post(this.url, loteDerivacion);
    }

    put(loteDerivacion: ILoteDerivacion): Observable<ILoteDerivacion> {
        return this.server.put(this.url, loteDerivacion);
    }

    patch(loteId, params: any): Observable<ILoteDerivacion> {
        return this.server.patch(this.url + loteId, params);
    }

}
