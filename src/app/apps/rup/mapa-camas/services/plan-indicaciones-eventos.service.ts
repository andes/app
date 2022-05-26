import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { first, map, tap } from 'rxjs/operators';

@Injectable()
export class PlanIndicacionesEventosServices extends ResourceBaseHttp {
    protected url = '/modules/rup/internacion/plan-indicaciones-eventos';
    constructor(protected server: Server) {
        super(server);
    }

    private lastEvent$;
    getLastEvent(indicacion) {
        const params = { indicacion: indicacion.id };
        this.lastEvent$ = this.server.get(this.url, { params }).pipe(
            map((eventos) => {
                eventos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
                return eventos[0];
            }),
        );
        return this.lastEvent$;
    }


}
