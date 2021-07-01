import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SeguimientoPacientesService } from '../../../services/seguimiento-pacientes.service';

@Component({
    selector: 'actualizar-seguimiento',
    templateUrl: './actualizar-seguimiento.html',
})
export class ActualizarSeguimientoComponent {
    @Input() seguimiento;
    @Output() returnDetalle: EventEmitter<any> = new EventEmitter<any>();
    @Output() verLlamado = new EventEmitter<any>();
    editContactos;

    constructor(
        private plex: Plex,
        private seguimientoPacientesService: SeguimientoPacientesService
    ) { }

    guardar() {
        this.seguimientoPacientesService.update(this.seguimiento.id, { organizacionSeguimiento: this.seguimiento.organizacionSeguimiento, contactosEstrechos: this.seguimiento.contactosEstrechos }).subscribe(() => {
            this.plex.toast('success', 'La derivación fue actualizada exitosamente');
            this.returnDetalle.emit(false);
        });
    }

    cerrar() {
        this.returnDetalle.emit(false);
    }

    hideSubmit($event) {
        this.editContactos = $event;
    }
}
