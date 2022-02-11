import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server, saveAs } from '@andes/shared';

@Injectable()
export class DocumentosService {
    private pdfURL = '/modules/descargas';

    constructor(private server: Server) { }

    download(url, data): Observable<any> {
        return this.server.post(this.pdfURL + '/' + url, data, { responseType: 'blob' } as any);
    }

    descargarInformeRUP(informe, nombreArchivo: string): Observable<any> {
        return this.download('pdf', informe).pipe(
            saveAs(nombreArchivo, 'pdf')
        );
    }

    enviarInformeRUP(datos): Observable<any> {
        return this.server.post('/modules/descargas/send/pdf', datos);
    }

    descargarConstanciaPuco(params, nombreArchivo: string): Observable<any> {
        return this.download('constanciaPuco/pdf', params).pipe(
            saveAs(nombreArchivo, 'pdf')
        );
    }

    descargarComprobanteDerivacion(derivacionId, nombreArchivo: string): Observable<any> {
        return this.download('reporteDerivacion', { derivacionId }).pipe(
            saveAs(nombreArchivo, 'pdf')
        );
    }

    descargarHistorialDerivacion(derivacionId: String, nombreArchivo: string): Observable<any> {
        return this.download('reporteDerivacion', { derivacionId, historial: true }).pipe(
            saveAs(nombreArchivo, 'pdf')
        );
    }

    descargarCensoMensual(data, nombreArchivo: string): Observable<any> {
        return this.download('censoMensual', data).pipe(
            saveAs(nombreArchivo, 'pdf')
        );
    }

    descargarCenso(data, nombreArchivo: string): Observable<any> {
        return this.download('censo', data).pipe(
            saveAs(nombreArchivo, 'pdf')
        );
    }

    descargarCensoCsv(params: any, nombreArchivo: string): Observable<any> {
        return this.server.post(`/modules/rup/internacion/censo-${params.tipo}/csv`, params, { responseType: 'blob' }).pipe(
            saveAs(nombreArchivo, 'csv')
        );
    }

    descargarReporteInternaciones(params, nombreArchivo: string): Observable<any> {
        return this.server.post('/bi/queries/listado-internacion/csv', { params }, { responseType: 'blob' } as any).pipe(
            saveAs(nombreArchivo, 'csv')
        );
    }

    descargarArancelamiento(params, nombreArchivo: string): Observable<any> {
        return this.download('arancelamiento/pdf', params).pipe(
            saveAs(nombreArchivo, 'pdf')
        );
    }

    descargarAgenda(params, nombreArchivo: string): Observable<any> {
        return this.download('agenda/pdf', params).pipe(
            saveAs(nombreArchivo, 'pdf')
        );
    }

    descargarListadoPerinatal(params, nombreArchivo: string): Observable<any> {
        return this.server.post('/bi/queries/listado-perinatal/csv', { params }, { responseType: 'blob' }).pipe(
            saveAs(nombreArchivo, 'csv')
        );
    }

    descargarReglasGlobales(params, nombreArchivo: string): Observable<any> {
        return this.server.post('/bi/queries/top-reglas-globales/csv', { params }, { responseType: 'blob' }).pipe(
            saveAs(nombreArchivo, 'csv')
        );
    }
}
