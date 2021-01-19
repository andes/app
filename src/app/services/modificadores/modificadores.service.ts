import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Server } from '@andes/shared';


@Injectable()
export class ModificadoresService {

    private apiUrl = '/modules/modificadores';  // URL to web api

    constructor(private server: Server) { }

    search(params: any): Observable<any> {
        return this.server.post(this.apiUrl, params);
    }
}
