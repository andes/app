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

    public pacienteEdited = { nombre: '', apellido: '', fechaNacimiento: null as Date | null };
    public pacienteFoto = { fotoId: '', id: '' };

    /**
     * verifica que al paciente se le haya editado al menos un campo (nombre y apellido)
     * y que los campos editados no sean vacíos
     */
    get pacienteEdit() {
        if (
            !this.pacienteEdited?.nombre ||
            !this.pacienteEdited?.apellido ||
            !this.pacienteEdited?.fechaNacimiento
        ) {
            return false;
        }

        const nombreDiff =
            this.pacienteEdited.nombre.trim().toUpperCase() !== this.paciente.nombre;

        const apellidoDiff =
            this.pacienteEdited.apellido.trim().toUpperCase() !== this.paciente.apellido;

        const fechaOriginal = moment(this.paciente.fechaNacimiento).format('YYYY-MM-DD');
        const fechaEditada = moment(this.pacienteEdited.fechaNacimiento).format('YYYY-MM-DD');

        const fechaDiff = fechaEditada !== fechaOriginal;

        return nombreDiff || apellidoDiff || fechaDiff;
    }

    formatFecha(fecha: Date): string {
        return fecha
            ? new Date(fecha).toISOString().split('T')[0]
            : '';
    }

    show() {
        this.pacienteFoto = this.paciente;
        this.modal.show();
        this.pacienteEdited.nombre = this.paciente.nombre;
        this.pacienteEdited.apellido = this.paciente.apellido;
        this.pacienteEdited.fechaNacimiento = this.paciente.fechaNacimiento;
    }

    notificarAccion(flag: boolean) {
        if (flag && this.pacienteEdit) {
            this.paciente.nombre = this.pacienteEdited.nombre;
            this.paciente.apellido = this.pacienteEdited.apellido;
            this.paciente.fechaNacimiento = this.pacienteEdited.fechaNacimiento;
            this.patientCorrected.emit(this.paciente);
        }
        this.modal.close();
    }
}
