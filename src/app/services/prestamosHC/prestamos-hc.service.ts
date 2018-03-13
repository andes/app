import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class PrestamosService {
    private turnoUrl = '/modules/prestamosCarpetas';

    constructor(private server: Server) { }

    getCarpetasSolicitud(filtros): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/getCarpetasSolicitud', filtros);
    }

    getCarpetasPrestamo(filtros): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/getCarpetasPrestamo', filtros);
    }

    prestarCarpeta(carpeta: any): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/prestarCarpeta', carpeta);
    }

    devolverCarpeta(carpeta): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/devolverCarpeta', carpeta);
    }
}
