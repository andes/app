import { Component, Output, ViewChild, Input, EventEmitter } from '@angular/core';
import { PlexModalComponent } from '@andes/plex';
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

    public pacienteEdited = { nombre: '', apellido: '' };
    public pacienteFoto = { fotoId: '', id: '' };

    /**
     * verifica que al paciente se le haya editado al menos un campo (nombre y apellido)
     * y que los campos editados no sean vacíos
     */
    get pacienteEdit() {
        const res = (this.pacienteEdited && this.pacienteEdited.nombre && this.pacienteEdited.apellido &&
            (this.pacienteEdited.nombre.toUpperCase() !== this.paciente.nombre ||
                this.pacienteEdited.apellido.toUpperCase() !== this.paciente.apellido));
        return res;
    }

    show() {
        this.pacienteFoto = this.paciente;
        this.modal.show();
        this.pacienteEdited.nombre = this.paciente.nombre;
        this.pacienteEdited.apellido = this.paciente.apellido;
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
