import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { InscripcionService } from '../services/inscripcion.service';
import { cache } from '@andes/shared';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { LocalidadService } from 'src/app/services/localidad.service';

@Component({
    selector: 'editar-inscripcion',
    templateUrl: 'editar-inscripcion.html'
})

export class EditarInscripcionComponent implements OnInit {
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
    public opcionesGrupos$: Observable<any>;
    public permisosEdicion;
    public localidades$: Observable<any>;

    @Input('inscripcion')
    set _inscripcion(value) {
        this.inscripcion = { ...value };
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

    constructor(
        private grupoPoblacionalService: GrupoPoblacionalService,
        private inscripcionService: InscripcionService,
        private localidadService: LocalidadService,
        public plex: Plex,
        private auth: Auth
    ) {
        this.opcionesGrupos$ = this.grupoPoblacionalService.search({ nombre: ['discapacidad', 'factores-riesgo'] }).pipe(
            cache()
        );
        this.localidades$ = this.localidadService.get({ codigo: 15 }).pipe(
            cache()
        );
    }

    ngOnInit() {
        this.permisosEdicion = this.auth.getPermissions('vacunacion:editar:?');
    }

    permiteEditar(campo: string) {
        return this.permisosEdicion[0] === '*' || this.permisosEdicion.some(p => p === campo);
    }

    cerrar() {
        this.returnEdicion.emit(null);
    }

    guardar() {
        if (this.nuevoEstado.id && this.inscripcion.estado !== this.nuevoEstado.id) {
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
