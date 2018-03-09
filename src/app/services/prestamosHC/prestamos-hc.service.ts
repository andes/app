import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class PrestamosService {
    private turnoUrl = '/modules/prestamosCarpetas';

    constructor(private server: Server) { }

    getCarpetas(filtros): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC', filtros);
    }

    prestarCarpeta(carpeta: any): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/prestarCarpeta', carpeta);
    }

    devolverCarpeta(carpeta): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/devolverCarpeta', carpeta);
    }
}
