import { AppSettings } from './../../appSettings';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { ServerService } from 'andes-shared/src/lib/server.service';

@Injectable()
export class TurnoService {
    private turnoUrl = AppSettings.API_ENDPOINT +'/modules/turnos/turno';  // URL to web api

    constructor(private server: ServerService, private http: Http) { }
    save(turno: any): Observable<any>{
        if (turno.idAgenda)
            //this.organizacionUrl + "/" + organizacion.id
            return this.server.put(this.turnoUrl+ "/" + turno.idAgenda, turno);
    }
}