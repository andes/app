import moment from 'moment';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { cache, calcularEdad } from '@andes/shared';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { LocalidadService } from 'src/app/services/localidad.service';
import { ProfesionService } from 'src/app/services/profesion.service';
import { InscripcionService } from '../services/inscripcion.service';

@Component({
    selector: 'editar-inscripcion',
    templateUrl: 'editar-inscripcion.html'
})

export class EditarInscripcionComponent implements OnInit, AfterViewChecked {
    public _inscripcion: any;
    public estados = [
        { id: 'pendiente', nombre: 'Pendiente' },
        { id: 'inhabilitado', nombre: 'Inhabilitado' },
        { id: 'fallecido', nombre: 'Fallecido' },
        { id: 'noCompletaEsquema', nombre: 'No completa esquema' }
    ];
    public fechaMinimaNacimiento = moment('1900-01-01').toDate();
    public fechaMaximaNacimiento = moment().subtract(60, 'years').toDate();
    public permiteCambioFechaNacimiento = false;
    public opcionesGrupos = [];
    public permisosEdicion;
    public localidades$: Observable<any>;
    public patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;
    public patronEmail = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    public morbilidades;
    public profesiones$: Observable<any>;
    public relacionLaboral = [
        { id: 'planta', label: 'Personal de planta' },
        { id: 'eventual', label: 'Personal con contrato eventual' },
        { id: 'terciarizado', label: 'Personal de empresas que brindan servicios terciarizados en ese establecimiento' },
        { id: 'locacion', label: 'Personal contratado por locación de servicios (monotributista, factura AFIP)' },
        { id: 'locacion', label: 'Personal autónomo que factura honorarios a través de colegios o instituciones similares' },
        { id: 'otros', label: 'Otros' },
    ];
    public dias = [
        { id: 'lunes', nombre: 'Lunes, miércoles y viernes' },
        { id: 'martes', nombre: 'Martes, jueves y sábados' },
        { id: 'nocorresponde', nombre: 'No corresponde a la situación' },
    ];
    public diaSeleccion = null;
    public profesion;
    @ViewChild('formulario', { static: false }) form: NgForm;

    @Input()
    set inscripcion(value) {
        this._inscripcion = { ...value };
        const validadoDomicilio = this._inscripcion.validaciones.includes('domicilio');
        if (this._inscripcion.grupo.nombre === 'mayores60' && !this._inscripcion.paciente) {
            this.permiteCambioFechaNacimiento = true;
        }
        if (this._inscripcion.paciente || validadoDomicilio) {
            this.estados.push(
                { id: 'habilitado', nombre: 'Habilitado' });
        }
        this._inscripcion.morbilidades = this._inscripcion.morbilidades.map(morbilidad => {
            return { id: morbilidad, label: morbilidad };
        });
        this.setGruposPosibles(this._inscripcion.fechaNacimiento);
    }
    get inscripcion() {
        return this._inscripcion;
    }

    @Output() returnEdicion: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private grupoPoblacionalService: GrupoPoblacionalService,
        private inscripcionService: InscripcionService,
        private localidadService: LocalidadService,
        private plex: Plex,
        private auth: Auth,
        private profesionesService: ProfesionService,
        private cdr: ChangeDetectorRef
    ) {
        this.localidades$ = this.localidadService.get({ codigo: 15 }).pipe(
            cache()
        );
        this.profesiones$ = this.profesionesService.get().pipe(
            cache()
        );
    }

    ngOnInit() {
        this.permisosEdicion = this.auth.getPermissions('vacunacion:editar:?');
        if (this._inscripcion.email) {
            this._inscripcion.email = this._inscripcion.email.toLowerCase().trim();
        }
    }

    ngAfterViewChecked() {
        this.form.control.markAllAsTouched();
        this.cdr.detectChanges();
    }

    permiteEditar(campo: string) {
        return this.permisosEdicion[0] === '*' || this.permisosEdicion.some(p => p === campo);
    }

    cerrar() {
        this.returnEdicion.emit(null);
    }

    setGruposPosibles(fechaNacimiento): void {
        const gruposPosibles = ['personal-salud', 'policia', 'discapacidad'];
        const edad = calcularEdad(fechaNacimiento, 'y');
        if (edad > 59) {
            gruposPosibles.push('mayores60');
        }

        forkJoin({
            fr: this.grupoPoblacionalService.cumpleExcepciones('factores-riesgo', { paciente: JSON.stringify({ edad }) }),
            sfr: this.grupoPoblacionalService.cumpleExcepciones('sin-factores-riesgo', { paciente: JSON.stringify({ edad }) }),
            pg: this.grupoPoblacionalService.cumpleExcepciones('personas-gestantes', { paciente: JSON.stringify({ edad }) }),
        }).subscribe(grupo => {
            if (grupo.fr) {
                gruposPosibles.push('factores-riesgo');
            }
            if (grupo.sfr) {
                gruposPosibles.push('sin-factores-riesgo');
            }
            if (grupo.pg) {
                gruposPosibles.push('personas-gestantes');
            }

            this.grupoPoblacionalService.search({ nombre: gruposPosibles }).subscribe(grupos => {
                const grupofr = grupos.find(g => g.nombre === 'factores-riesgo');
                if (grupofr) {
                    this.morbilidades = grupofr.morbilidades;
                }
                this.opcionesGrupos = grupos;
                const tieneGrupoValido = this.opcionesGrupos.find(opcionGrupo => opcionGrupo.nombre === this._inscripcion.grupo.nombre);
                if (!tieneGrupoValido) {
                    this._inscripcion.grupo = null;
                }
            });
        });
    }

    guardar() {
        if (this._inscripcion.estado.id) {
            this._inscripcion.estado = this._inscripcion.estado.id;
        }
        if (this._inscripcion.grupo.nombre === 'factores-riesgo') {
            this._inscripcion.morbilidades = this._inscripcion.morbilidades ? this._inscripcion.morbilidades.map(c => c.id) : [];
        } else {
            this._inscripcion.morbilidades = [];
        }
        this._inscripcion.diaseleccionados = this.diaSeleccion ? this.diaSeleccion.id : '';
        this.inscripcionService.update(this._inscripcion.id, this._inscripcion).subscribe(resultado => {
            this.returnEdicion.emit(resultado);
            this.plex.toast('success', 'La inscripción ha sido actualizada exitosamente');
        }, error => {
            this.plex.toast('danger', 'La inscripción no pudo ser actualizada');
        });
    }

}
