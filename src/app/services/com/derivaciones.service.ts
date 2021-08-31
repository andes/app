import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class DerivacionesService extends ResourceBaseHttp {
    protected url = '/modules/com/derivaciones';
    constructor(protected server: Server) { super(server); }
    private apiUrl = environment.API;

    updateHistorial(id, movimiento) {
        return this.server.post(`/modules/com/derivaciones/${id}/historial`, movimiento);
    }
}
