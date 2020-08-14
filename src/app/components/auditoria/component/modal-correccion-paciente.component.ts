import { Component, Output, ViewChild, Input, EventEmitter, OnInit } from '@angular/core';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'modal-correccion-paciente',
    templateUrl: 'modal-correccion-paciente.html'
})

export class ModalCorreccionPacienteComponent {

    @ViewChild('modal', { static: true }) modal: PlexModalComponent;

    @Input() paciente: IPaciente;

    @Input()
    set show(value) {
        if (value) {
            this.modal.show();
            this.pacienteEdited.apellido = this.paciente.apellido;
            this.pacienteEdited.nombre = this.paciente.nombre;

        }
    }

    @Output() patientCorrected = new EventEmitter<any>();

    public pacienteEdited = { nombre: '', apellido: '' };

    /**
     * verifica que al paciente se le haya editado al menos un campo (nombre y apellido)
     * y que los campos editados no sean vacíos
     */
    pacienteEdit() {

        let res = (this.pacienteEdited && this.pacienteEdited.nombre && this.pacienteEdited.apellido &&
            (this.pacienteEdited.nombre.toUpperCase() !== this.paciente.nombre ||
                this.pacienteEdited.apellido.toUpperCase() !== this.paciente.apellido));
        return res;
    }

    notificarAccion(flag: boolean) {
        if (flag && this.pacienteEdit()) {
            this.paciente.nombre = this.pacienteEdited.nombre;
            this.paciente.apellido = this.pacienteEdited.apellido;
            this.patientCorrected.emit(this.paciente);
        } else {
            this.patientCorrected.emit(null);
        }
        this.modal.showed = false;
    }
}
