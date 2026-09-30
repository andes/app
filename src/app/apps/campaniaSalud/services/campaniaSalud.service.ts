import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { ICampaniaSalud } from '../interfaces/ICampaniaSalud';
import { Observable } from 'rxjs';

@Injectable()
export class CampaniaSaludService {
    // campaniaSeleccionada: ICampaniaSalud;
    // campanias: ICampaniaSalud[];
    readonly campaniaUrl = '/core/tm/campanias';

    constructor(private server: Server) {
    }

    get(params?): Observable<ICampaniaSalud[]> {
        return this.server.get(this.campaniaUrl, { params: params });
    }
    putCampanias(campania: ICampaniaSalud) {
        return this.server.put(this.campaniaUrl + '/' + campania.id, campania);
    }
    postCampanias(campania: ICampaniaSalud) {
        return this.server.post(this.campaniaUrl, campania);
    }
    /**
     * Devuelve el nombre del estado de la campaña pasada por parámetro
     *
     * @param {ICampaniaSalud} campania
     * @returns {String}
     * @memberof CampaniaSaludService
     */
    getEstado(campania: ICampaniaSalud): string {
        return campania.activo ? 'Activada' : 'Desactivada';
    }
}
