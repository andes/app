import { Component, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from '../services/inscripcion.service';
import { Plex } from '@andes/plex';

@Component({
    selector: 'notas',
    templateUrl: 'notas.html'
})

export class NotasComponent {
    public inscripcion: any;
    public showForm = false;
    public notasPredefinidas = [
        { id: 'turno-asignado', nombre: 'Turno asignado' },
        { id: 'no-quiere', nombre: 'No quiere vacunarse' },
        { id: 'vacunado', nombre: 'Ya se vacunó' },
        { id: 'no-contesta', nombre: 'No contesta' },
        { id: 'otra', nombre: 'Otra' }
    ];
    public notaPredefinida;
    public notaPersonalizada = '';

    @Input('inscripcion')
    set _inscripcion(value) {
        this.inscripcion = { ...value };
        this.showForm = false;
        this.uploadNota();
    }
    @Output() returnNotas: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private inscripcionService: InscripcionService,
        public plex: Plex,
    ) { }

    uploadNota() {
        this.notaPredefinida = '';
        this.notaPersonalizada = '';

        if (this.inscripcion.nota) {
            const opcionNota = this.notasPredefinidas.find(n => n.nombre === this.inscripcion.nota);
            if (opcionNota) {
                this.notaPredefinida = opcionNota;
            } else {
                this.notaPredefinida = { id: 'otra', nombre: 'Otra' };
                this.notaPersonalizada = this.inscripcion.nota;
            }
        }
    }

    cerrar() {
        this.returnNotas.emit(null);
        this.showForm = false;
        this.uploadNota();
    }

    editarNota() {
        this.showForm = true;
        this.uploadNota();
    }

    agregarNota() {
        this.showForm = true;
    }

    guardar() {
        if (this.notaPredefinida.id === 'otra') {
            this.inscripcion.nota = this.notaPersonalizada;
        } else {
            this.inscripcion.nota = this.notaPredefinida.nombre;
        }
        this.inscripcionService.update(this.inscripcion.id, this.inscripcion).subscribe(resultado => {
            this.returnNotas.emit(resultado);
            this.showForm = false;
            this.plex.toast('success', 'Nota agregada con éxito');
        }, error => {
            this.plex.toast('danger', 'La inscripción no pudo ser actualizada');
        });
    }

    eliminar() {
        this.inscripcion.nota = '';
        this.inscripcionService.update(this.inscripcion.id, this.inscripcion).subscribe(resultado => {
            this.returnNotas.emit(resultado);
            this.plex.toast('success', 'Nota eliminada con éxito');
            this.showForm = false;
        }, error => {
            this.plex.toast('danger', 'La nota no pudo ser eliminada');
        });
    }

}
