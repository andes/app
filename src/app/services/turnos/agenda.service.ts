import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { ServerService } from 'andes-shared/src/lib/server.service';

@Injectable()
export class AgendaService {
    private agendaUrl = 'http://localhost:3002/api/turnos/agenda';  // URL to web api

    constructor(private server: ServerService, private http: Http) { }

    get(params: any): Observable<IAgenda[]> {
        return this.server.get(this.agendaUrl, params);
    }

    getById(id: String): Observable<IAgenda[]> {
        return this.server.get(this.agendaUrl + "/" + id, null);
    }

    save(agenda: IAgenda): Observable<IAgenda>{
        if (agenda.id)
            return this.server.put(this.agendaUrl+ "/" + agenda.id, agenda);
        else
            return this.server.post(this.agendaUrl, agenda);
    }
}