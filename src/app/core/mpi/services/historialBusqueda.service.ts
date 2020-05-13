import { Injectable } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';

Injectable();
export class HistorialBusquedaService {

    private historial: IPaciente[] = [];
    private limite = 8;

    add(paciente: any) {
        if (paciente.vinculos) {
            this.historial = this.historial.filter(pac => !paciente.vinculos.includes(pac.id));
        } else {
            this.historial = this.historial.filter(pac => pac.id !== paciente.id);
        }
        this.historial.unshift(paciente);

        if (this.historial.length > this.limite) {
            this.historial.pop();
        }
    }

    get(): IPaciente[] {
        return this.historial;
    }
}
