import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DominiosNacionalesService {
    private ipsUrl = '/modules/ips/';  // URL to web api
    constructor(
        private server: Server
    ) { }

    getDominiosIdPaciente(idPaciente: String): Observable<any> {
        return this.server.get(this.ipsUrl + 'dominios/' + idPaciente);
    }

    getDocumentos(params: any): Observable<any> {
        return this.server.get(this.ipsUrl + 'documentos/', { params: params, showError: true });
    }
}
