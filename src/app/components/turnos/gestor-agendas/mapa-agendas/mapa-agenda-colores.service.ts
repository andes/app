import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type MapaAgendaColorOrigen = 'global' | 'organizacion' | 'profesional';

export interface MapaAgendaColorResuelto {
    conceptId: string;
    color: string;
    origen: MapaAgendaColorOrigen;
}

export interface MapaAgendaColoresResolverParams {
    /** Uno o varios SNOMED conceptId (array o repetición en query según Server). */
    conceptId?: string | string[];
    profesional?: string;
    servicioIntermedio?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MapaAgendaColoresService extends ResourceBaseHttp {
    protected url = '/modules/turnos/mapa-agenda-colores';

    constructor(protected server: Server) {
        super(server);
    }

    resolver(params: MapaAgendaColoresResolverParams = {}): Observable<MapaAgendaColorResuelto[]> {
        return this.server.get(`${this.url}/resolver`, {
            params,
            showError: this.showError
        });
    }
}
