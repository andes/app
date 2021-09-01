import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class ConfiguracionPrestacionService {
    private configPres = '/core/term/configuracionPrestaciones'; // URL to web api
    constructor(private server: Server) { }

    get(params: any): Observable<any[]> {
        return this.server.get(this.configPres, { params: params, showError: true });
    }

    put(params: any): Observable<any> {
        return this.server.put(this.configPres, params);
    }

    post(params: any): Observable<any> {
        return this.server.post(this.configPres, params);
    }
}
