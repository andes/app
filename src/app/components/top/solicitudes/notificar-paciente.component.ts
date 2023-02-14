import { Input, Component, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'notificar-paciente',
    templateUrl: './notificar-paciente.html',
})
export class NotificarPacienteComponent {

    @Output() cancelarNotificacion = new EventEmitter();
    @Output() returnNotificarPaciente = new EventEmitter();

    constructor() { }
    public fechaNotificacion;
    public descripcionNotificacion: string;
    public hoy: Date = moment().toDate();

    guardar() {
        const data = {
            fecha: this.fechaNotificacion,
            descripcion: this.descripcionNotificacion
        };
        this.returnNotificarPaciente.emit(data);
    }

    cancelar() {
        this.cancelarNotificacion.emit();
    }

}
