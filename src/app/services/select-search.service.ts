import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class SelectSearchService {

    constructor(private server: Server) { }

    get(recurso, texto): Observable<any[]> {
        let search = null;
        if (texto) {
            search = `^${texto}`;
        }
        const params = {
            search,
            fields: 'nombre'
        };
        return this.server.get(`/core/tm/${recurso}`, { params, showError: true });
    }

}
