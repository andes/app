import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { saveAs as saveAsFileSaver } from 'file-saver';
import { Slug } from 'ng2-slugify';
import { Server } from '@andes/shared';
import { tap } from 'rxjs/operators';

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
        return this.server.post('/bi/queries/listado-internacion/csv', params, { responseType: 'blob' } as any);
    }
}

export type Extensiones = 'pdf' | 'csv';

function getHeaders(type: Extensiones) {
    if (type === 'pdf') {
        return { type: 'application/pdf' };
    } else if (type === 'csv') {
        return { type: 'text/csv' };
    }
}

export function saveAs(fileName: string, type: Extensiones, timestamp = true) {
    return tap((blobData: any) => {
        const slug = new Slug('default');
        const headers = getHeaders(type);
        if (blobData) {
            const blob = new Blob([blobData], headers);
            const timestampText = timestamp ? ` - ${moment().format('DD-MM-YYYY-hmmss')}` : '';
            const file = slug.slugify(`${fileName}${timestampText}.${type}`);
            saveAsFileSaver(blob, file);
        } else {
            window.print();
        }
    });
}
