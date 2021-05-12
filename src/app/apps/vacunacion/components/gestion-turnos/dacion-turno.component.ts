import { Component, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from '../../services/inscripcion.service';
import { Plex } from '@andes/plex';

@Component({
    selector: 'dacion-turno',
    templateUrl: 'dacion-turno.html'
})

export class DacionTurnoComponent {
    public inscripcion: any;
    public fechaMinimaNacimiento = moment().toDate();
    @Input('inscripcion')
    set _inscripcion(value) {
        this.inscripcion = { ...value };
        if (!this.inscripcion.turno) {
            this.inscripcion.turno = {};
        }
    }
    @Output() returnDacionTurno: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private inscripcionService: InscripcionService,
        public plex: Plex,
    ) {
    }

    cerrar() {
        this.returnDacionTurno.emit(null);
    }

    guardar() {
        this.inscripcionService.update(this.inscripcion.id, this.inscripcion).subscribe(resultado => {
            this.returnDacionTurno.emit(resultado);
            this.plex.toast('success', 'La inscripción ha sido actualizada exitosamente');
        }, error => {
            this.plex.toast('danger', 'La inscripción no pudo ser actualizada');
        });
    }

}
