import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Server } from '@andes/shared';

@Injectable()
export class SisaService {

    private sisaUrl = '/modules/fuentesAutenticas';  // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<any> {
        return this.server.get(this.sisaUrl + '/sisa', { params: params, showError: true });
    }

    getPaciente(params: any): Observable<any> {
        return this.server.get(this.sisaUrl + '/pacienteSisa', { params: params, showError: true });
    }

    getPuco(dni: any): Observable<any> {
        return this.server.get(this.sisaUrl + '/puco/' + dni);
    }
}
