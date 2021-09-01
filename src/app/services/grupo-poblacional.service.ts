import { Injectable } from '@angular/core';
import { Server, ResourceBaseHttp } from '@andes/shared';
import { Observable } from 'rxjs';

@Injectable()
export class GrupoPoblacionalService extends ResourceBaseHttp {
    protected url = '/core/tm/grupo-poblacional';
    constructor(protected server: Server) {
        super(server);
    }

    cumpleExcepciones(grupo: String, params: any): Observable<any> {
        return this.server.get(`${this.url}/excepciones/${grupo}`, { params: params, showError: true });
    }
}
