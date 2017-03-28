import { Server } from '@andes/shared';
import { IEspacioFisico } from './../../interfaces/turnos/IEspacioFisico';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class EspacioFisicoService {
    private espacioFisicoUrl = '/modules/turnos/espacioFisico';  // URL to web api
    constructor(private server: Server) { }

    get(params: any): Observable<IEspacioFisico[]> {
        return this.server.get(this.espacioFisicoUrl, {params: params, showError: true});
    }

    post(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        return this.server.post(this.espacioFisicoUrl, espacioFisico);
    }

    put(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        return this.server.put(this.espacioFisicoUrl + '/' + espacioFisico.id, espacioFisico);
    }

    disable(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        espacioFisico.activo = false;
        return this.put(espacioFisico);
    }

    enable(espacioFisico: IEspacioFisico): Observable<IEspacioFisico> {
        espacioFisico.activo = true;
        return this.put(espacioFisico);
    }
}
