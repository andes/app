import { Injectable } from '@angular/core';
import { Paciente } from '../modelos/paciente';
import { PACIENTES } from '../mock-data/mock-pacientes';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MapaCamaListadoColumns {
    key: boolean;
    value: string;
}

@Injectable()

export class PacienteService {
    public columnsMapa = new BehaviorSubject<MapaCamaListadoColumns[]>({} as any);
    public sortBy = new BehaviorSubject<string>(null);
    public sortOrder = new BehaviorSubject<string>(null);
    constructor() {
    }

    getPacientes(): Observable<Paciente[]> {
        return of(PACIENTES);
    }

    getPaciente(id: number | string) {
        return this.getPacientes().pipe(
            map((pacientes: Paciente[]) => pacientes.find(paciente => paciente.id === +id))
        );
    }

}
