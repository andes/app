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

    descargarConstanciaPuco(params): Observable<any> {
        return this.download('constanciaPuco/pdf', params);
    }

    descargarCensoMensual(data): Observable<any> {
        return this.download('censoMensual', data);
    }

    descargarCenso(data): Observable<any> {
        return this.download('censo', data);
    }

    descargarReporteInternaciones(params): Observable<any> {
        return this.server.post('/bi/queries/listado-internacion/csv', { params }, { responseType: 'blob' } as any);
    }
}
