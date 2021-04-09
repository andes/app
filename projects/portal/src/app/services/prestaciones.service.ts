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


    getTurnos(query): Observable<any[]> {
        const token = this.auth.getToken();
        const headers = new HttpHeaders({ Authorization: 'JWT ' + token });
        const params = new HttpParams({ fromObject: query });
        const options = { headers, params };
        return this.server.get(this.agendaUrl + '/turnos', options);


    }

    getTurno(id: number | string, params) {
        return this.getTurnos(params).pipe(
            map((turnos) => turnos.find(turno => turno._id === id)));
    }


}
