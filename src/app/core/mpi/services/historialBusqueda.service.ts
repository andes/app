import { Injectable } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';

Injectable();
export class HistorialBusquedaService {

    private historial: IPaciente[] = [];
    private limite = 8;

    add(paciente: IPaciente) {
        this.historial = this.historial.filter(pac => pac.id !== paciente.id);
        this.historial.unshift(paciente);

        if (this.historial.length > this.limite) {
            this.historial.pop();
        }
    }

    get(): IPaciente[] {
        return this.historial;
    }
}
