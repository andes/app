import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IAgenda } from 'src/app/interfaces/turnos/IAgenda';

@Component({
    selector: 'historial-agenda',
    templateUrl: 'historial-agenda.html',
    styles: [`
        table {
            border-top: hidden;
        }
    `]
})

export class HistorialAgendaComponent {
    @Input() agenda: IAgenda;

    @Output() cerrarHistorial = new EventEmitter();

    type(estadoHistorial: string): string {
        if (['pausada', 'pendienteAuditoria', 'pendienteAsistencia'].includes(estadoHistorial)) {
            return 'warning';
        }
        if (['publicada', 'disponible'].includes(estadoHistorial)) {
            return 'success';
        }
        if (['auditada'].includes(estadoHistorial)) {
            return 'info';
        }
        if (['suspendida'].includes(estadoHistorial)) {
            return 'danger';
        } else {
            return 'default'; // planificacion u otros
        }
    }

    onClose() {
        this.cerrarHistorial.emit(true);
    }
}
