import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class PrestamosService {
    private turnoUrl = '/modules/prestamosCarpetas';

    constructor(private server: Server) { }

    getCarpetasSolicitud(filtros): Observable<any[]> {
        return this.server.get(this.turnoUrl + '/prestamosHC/solicitudes', { params: filtros });
    }

    getCarpetasPrestamo(filtros): Observable<any[]> {
        return this.server.get(this.turnoUrl + '/prestamosHC/prestamos', { params: filtros });
    }

    getHistorialCarpetas(filtros): Observable<any[]> {
        return this.server.get(this.turnoUrl + '/prestamosHC/historial', { params: filtros });
    }

    prestarCarpeta(carpeta: any): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/prestarCarpeta', carpeta);
    }

    prestarCarpetas(carpetas): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/prestarCarpetas', carpetas);
    }

    devolverCarpeta(carpeta): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/devolverCarpeta', carpeta);
    }

    devolverCarpetas(carpetas): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/devolverCarpetas', carpetas);
    }

    solicitudManualCarpeta(solicitud): Observable<any[]> {
        return this.server.post(this.turnoUrl + '/prestamosHC/manual', solicitud);
    }
}
