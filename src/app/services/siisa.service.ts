import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

import { ISiisa } from '../interfaces/ISiisa';

@Injectable()
export class SIISAService {
    private siisaUrl = '/core/tm/siisa'; // URL to web api

    constructor(private server: Server) { }

    getEspecialidades(): Observable<ISiisa> {
        // TODO: buscar Por id
        return this.server.get(this.siisaUrl + '/especialidad', null);
    }

    getModalidadesCertificacionEspecialidades(): Observable<ISiisa> {
        return this.server.get(this.siisaUrl + '/modalidadesCertificacion', null);
    }

    getEntidadesFormadoras(): Observable<ISiisa> {
        return this.server.get(this.siisaUrl + '/entidadesFormadoras', null);
    }

    getEstablecimientosCertificadores(): Observable<ISiisa> {
        return this.server.get(this.siisaUrl + '/establecimientosCertificadores', null);
    }
    getProfesiones(): Observable<ISiisa[]> {
        return this.server.get(this.siisaUrl + '/profesion', null);
    }
}
