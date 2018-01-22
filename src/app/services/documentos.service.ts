import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';

@Injectable()
export class DocumentosService {

    // URL to web api
    private pdfUrl = '/modules/descargas';

    constructor(private server: Server) { }

    descargar(html: String): Observable<any[]> {
        return this.server.post(this.pdfUrl + '/pdf', html);
    }

}
