import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';

@Injectable()
export class PrestacionLegacyService {
    private prestacionLegacyUrl = '/core/term/prestacionesLegacy';  // URL to web api
    constructor(private server: Server) { }

    get(params: any): Observable<any> {
        return this.server.get(this.prestacionLegacyUrl, { params: params, showError: true });
    }

    getById(id: String): Observable<any> {
        return this.server.get(this.prestacionLegacyUrl + '/' + id, null);
    }
}
