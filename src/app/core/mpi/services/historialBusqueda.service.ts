import { Injectable } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { BehaviorSubject } from 'rxjs';

Injectable();
@Injectable()
export class HistorialBusquedaService {

    private historial: BehaviorSubject<IPaciente[]> = new BehaviorSubject([]);
    public historial$ = this.historial.asObservable();

    private limite = 8;

    add(paciente: IPaciente) {
        let hist;

        if (paciente.vinculos) {
            hist = this.get().filter((pac: any) => !paciente.vinculos.includes(pac.id));
        } else {
            hist = this.get().filter((pac: any) => pac.id !== paciente.id);
        }
        hist.unshift(paciente);

        if (hist.length > this.limite) {
            hist.pop();
        }
        this.historial.next(hist);
    }

    get(): IPaciente[] {
        return this.historial.getValue();
    }

    delete(paciente: IPaciente) {
        const hist = this.get().filter((pac: any) => pac.id !== paciente.id);
        this.historial.next(hist);
    }
}
