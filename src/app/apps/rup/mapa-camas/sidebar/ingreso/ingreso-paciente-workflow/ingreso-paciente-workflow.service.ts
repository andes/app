import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class IngresoPacienteService {
    public selectedPaciente = new BehaviorSubject<string>(null);

    selectPaciente(pacienteID: string) {
        if (!pacienteID) {
            return this.selectedPaciente.next(null);
        }
        this.selectedPaciente.next(pacienteID);
    }
}
