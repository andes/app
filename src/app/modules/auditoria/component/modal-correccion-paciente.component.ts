import { Component, Output, ViewChild, Input, EventEmitter } from '@angular/core';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'modal-correccion-paciente',
    templateUrl: 'modal-correccion-paciente.html',
    styleUrls: ['modal-correccion-paciente.scss']
})

export class ModalCorreccionPacienteComponent {

    @Input() paciente: IPaciente;
    @Output() patientCorrected = new EventEmitter<IPaciente>();
    @ViewChild('modal', { static: true }) modal: PlexModalComponent;

    public pacienteEdited = { foto: '', fotoId: '', nombre: '', apellido: '' };

    /**
     * verifica que al paciente se le haya editado al menos un campo (nombre y apellido)
     * y que los campos editados no sean vacíos
     */
    get pacienteEdit() {
        let res = (this.pacienteEdited && this.pacienteEdited.nombre && this.pacienteEdited.apellido &&
            (this.pacienteEdited.nombre.toUpperCase() !== this.paciente.nombre ||
                this.pacienteEdited.apellido.toUpperCase() !== this.paciente.apellido));
        return res;
    }

    show() {
        this.pacienteEdited = this.paciente;
        this.modal.show();
        // this.pacienteEdited.apellido = this.paciente.apellido;
        // this.pacienteEdited.nombre = this.paciente.nombre;
    }

    notificarAccion(flag: boolean) {
        if (flag && this.pacienteEdit) {
            this.paciente.nombre = this.pacienteEdited.nombre;
            this.paciente.apellido = this.pacienteEdited.apellido;
            this.patientCorrected.emit(this.paciente);
        }
        this.modal.close();
    }
}
