import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAgenda } from './../../interfaces/turnos/IAgenda';

@Injectable()
export class AgendaService {

    // URL to web api
    private agendaUrl = '/modules/turnos/agenda';
    private baseUrlMobile = '/modules/mobileApp';


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
    findCantidadConsultaXPrestacion(params: any): Observable<any> {
        return this.server.get(this.agendaUrl + '/cantidadConsultaXPrestacion', { params: params, showError: true });
    }

    findResumenDiarioMensual(params: any): Observable<any> {
        return this.server.get(this.agendaUrl + '/reporteResumenDiarioMensuals', { params: params, showError: true });
    }

    findPlanillaC1(params: any): Observable<any> {
        return this.server.get(this.agendaUrl + '/reportePlanillaC1', { params: params, showError: true });
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

    clonar(id: string, data: any): Observable<IAgenda[]> {
        return this.server.post(this.agendaUrl + `/${id}/clonar`, data);
    }

    getAgendasDisponibles(params) {
        return this.server.get(this.baseUrlMobile + '/agendasDisponibles', { params: params });
    }
}
