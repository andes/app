import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Auth } from '@andes/auth';
import { HttpHeaders, HttpParams } from '@angular/common/http';
@Injectable({
    providedIn: 'root',
})

export class PrestacionService {

    private agendaUrl = '/modules/mobileApp';

    constructor(
        private server: Server,
        private auth: Auth
    ) { }


    getTurnos(): Observable<any[]> {
        return this.server.get(this.agendaUrl + '/turnos');
    }

    getTurno(id: number | string) {
        return this.getTurnos().pipe(
            map((turnos) => turnos.find(turno => turno._id === id)));
    }


}
