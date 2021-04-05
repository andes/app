import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})

export class PrestacionService {

    private vacunasURL = '/modules/vacunas';

    constructor(
        private server: Server,

    ) { }

    getVacunas(idPaciente: String): Observable<any[]> {
        return this.server.get(this.vacunasURL + '/paciente/' + idPaciente, null);
    }


    getVacuna(id: number | string, idPaciente) {
        return this.getVacunas(idPaciente).pipe(
            map((vacunas) => vacunas.find(vacuna => vacuna.id === id))
        );
    }



}
