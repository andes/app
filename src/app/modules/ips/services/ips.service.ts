import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Server } from '@andes/shared';

@Injectable()
export class IPSService {

    private ipsURL = '/modules/ips';  // URL to web api
    constructor(private server: Server) { }

    getDominios(idPaciente: String): Observable<any> {
        return this.server.get(this.ipsURL + '/dominios/' + idPaciente, null);
    }
    getDocumentos(idPaciente: String): Observable<any> {
        return this.server.get(this.ipsURL + '/document/' + idPaciente, null);
    }
    getTokenProfesional(params: any): Observable<any> {
        console.log(params);
        return this.server.get(this.ipsURL + '/token', { params: params, showError: true });
    }
}
