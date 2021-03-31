import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { cache } from '@andes/shared';
import { InscripcionService } from '../services/inscripcion.service';
import { Plex } from '@andes/plex';

@Component({
    selector: 'editar-inscripcion',
    templateUrl: 'editar-inscripcion.html'
})

export class EditarInscripcionComponent {
    public inscripcion: any;
    public estados = [
        { id: 'pendiente', nombre: 'pendiente' },
        { id: 'inhabilitado', nombre: 'inhabilitado' }
    ];
    public fechaMinimaNacimiento = moment('1900-01-01').toDate();
    public fechaMaximaNacimiento = moment().subtract(60, 'years').toDate();
    public nuevaFechaNacimiento = null;
    public permiteCambioFechaNacimiento = false;
    public permiteCambioGrupo = false;
    public nuevoEstado;
    @Input('inscripcion')
    set _inscripcion(value) {
        this.inscripcion = value;
        const validadoDomicilio = this.inscripcion.validaciones.includes('domicilio');
        if (this.inscripcion.grupo.nombre === 'mayores60' && !this.inscripcion.paciente) {
            this.permiteCambioFechaNacimiento = true;
            this.nuevaFechaNacimiento = this.inscripcion.fechaNacimiento;
        }
        if (this.inscripcion.grupo.nombre === 'discapacidad' || this.inscripcion.grupo.nombre === 'factores-riesgo') {
            this.permiteCambioGrupo = true;
        }
        if (this.inscripcion.paciente || validadoDomicilio) {
            this.estados.push(
                { id: 'habilitado', nombre: 'habilitado' });
        }
        this.nuevoEstado = this.inscripcion.estado;
    }
    @Output() returnEdicion: EventEmitter<any> = new EventEmitter<any>();
    public opcionesGrupos$: Observable<any>;

    constructor(
        private grupoPoblacionalService: GrupoPoblacionalService,
        private inscripcionService: InscripcionService,
        public plex: Plex
    ) {
        this.opcionesGrupos$ = this.grupoPoblacionalService.search({ nombre: ['discapacidad', 'factores-riesgo'] }).pipe(
            cache()
        );
    }

    cerrar() {
        this.returnEdicion.emit(null);
    }

    guardar() {
        if (this.inscripcion.estado !== this.nuevoEstado.id) {
            this.inscripcion.estado = this.nuevoEstado.id;
        }
        if (this.inscripcion.grupo.nombre === 'mayores60' && this.nuevaFechaNacimiento) {
            this.inscripcion.fechaNacimiento = this.nuevaFechaNacimiento;
        }
        this.inscripcionService.update(this.inscripcion.id, this.inscripcion).subscribe(resultado => {
            this.returnEdicion.emit(resultado);
            this.plex.toast('success', 'La inscripción ha sido actualizada exitosamente');
        }, error => {
            this.plex.toast('danger', 'La inscripción no pudo ser actualizada');
        });
    }

}
