import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';

@Injectable()
export class DominiosNacionalesService {
    private ipsUrl = '/modules/ips/';  // URL to web api
    constructor(
        private server: Server
        ) { }

        getDominiosIdPaciente(idPaciente: String): Observable<any> {
            return this.server.get(this.ipsUrl + 'getDomains/' + idPaciente);
        }

        getDocumentos(params: any): Observable<any> {
            return this.server.get(this.ipsUrl + 'getDocuments/', { params: params, showError: true });
        }
}
