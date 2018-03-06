import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class PrestamosService {
    private turnoUrl = '/modules/prestamosCarpetas';

    constructor(private server: Server) { }

    getCarpetas(): Observable<any[]> {
        return this.server.get(this.turnoUrl + '/prestamosHC');
    }

    prestarCarpeta(params: any): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/prestarCarpeta', { params: params, showError: true });
    }

    devolverCarpeta(carpeta): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/devolverCarpeta', carpeta);
    }
}