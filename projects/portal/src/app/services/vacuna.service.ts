import { Injectable } from '@angular/core';
import { cacheStorage, Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})

export class VacunaService {

    private vacunasURL = '/modules/vacunas';

    constructor(
        private server: Server,

    ) { }

    getVacunas(idPaciente: String): Observable<any[]> {
        return this.server.get(this.vacunasURL + '/paciente/' + idPaciente, null).pipe(
            cacheStorage({ key: 'vacunas', ttl: 60 * 24 })
        );
    }


    getVacuna(id: number | string, idPaciente) {
        return this.getVacunas(idPaciente).pipe(
            map((vacunas) => vacunas.find(vacuna => vacuna.id === id))
        );
    }



}
