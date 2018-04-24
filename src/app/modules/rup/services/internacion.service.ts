import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class InternacionService {

    private url = '/modules/rup/internaciones';
    constructor(private server: Server) { }


    getInfoCenso(params: any): Observable<any[]> {
        return this.server.get(this.url + '/censo', { params: params });
    }

    getCensoMensual(params: any): Observable<any[]> {
        return this.server.get(this.url + '/censoMensual', { params: params });
    }

    liberarCama(idInternacion: any, fecha): Observable<any> {
        let param = {
            fecha: fecha
        };
        return this.server.patch(this.url + '/desocuparCama/' + idInternacion, param);
    }

    getCamaDisponibilidadCenso(params: any): Observable<any[]> {
        return this.server.get(this.url + '/censo/disponibilidad', { params: params });
    }

}
