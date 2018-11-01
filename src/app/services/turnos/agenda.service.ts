import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../../environments/environment';

@Injectable()
export class AgendaService {

    // URL to web api
    private agendaUrl = '/modules/turnos/agenda';

    constructor(private server: Server) { }

    find(idPaciente: String): Observable<IAgenda[]> {
        return this.server.get(this.agendaUrl + '/paciente' + '/' + idPaciente);
    }

    findCandidatas(params: any): Observable<IAgenda[]> {
        return this.server.get(this.agendaUrl + '/candidatas', { params: params, showError: true });
    }

    findDiagnosticos(params: any): Observable<any> {
        return this.server.get(this.agendaUrl + '/diagnosticos', { params: params, showError: true });
    }
    findConsultaDiagnosticos(params: any): Observable<any> {
        return this.server.get(this.agendaUrl + '/consultaDiagnostico', { params: params, showError: true });
    }
    findCantidadConsultaXPrestacion(params: any): Observable<any> {
        return this.server.get(this.agendaUrl + '/cantidadConsultaXPrestacion', { params: params, showError: true });
    }


    get(params: any): Observable<IAgenda[]> {
        return this.server.get(this.agendaUrl, { params: params, showError: true });
    }

    getById(id: String): Observable<IAgenda> {
        return this.server.get(this.agendaUrl + '/' + id, null);
    }

    patch(id: String, cambios: any): Observable<IAgenda> {
        return this.server.patch(this.agendaUrl + '/' + id, cambios);
    }

    patchMultiple(id: String, params: any): Observable<IAgenda> {
        return this.server.patch(this.agendaUrl + '/' + id + '/multiple', params);
    }

    patchCodificarTurno(params: any): Observable<IAgenda> {
        return this.server.patch(this.agendaUrl, params);
    }

    save(agenda: IAgenda): Observable<IAgenda> {
        if (agenda.id) {
            return this.server.put(this.agendaUrl + '/' + agenda.id, agenda);
        } else {
            return this.server.post(this.agendaUrl, agenda);
        }
    }

    clonar(data: any): Observable<IAgenda[]> {
        return this.server.post(this.agendaUrl + '/clonar', data);
    }
}
