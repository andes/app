import { InscripcionService } from './../../services/inscripcion.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { ICiudadano } from '../../interfaces/ICiudadano';
import { Observable } from 'rxjs';
import { cache } from '@andes/shared';
import { LocalidadService } from 'src/app/services/localidad.service';
import { ProfesionService } from 'src/app/services/profesion.service';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';

@Component({
    selector: 'nueva-inscripcion',
    templateUrl: './nueva-inscripcion.html',
})
export class NuevaInscripcionComponent implements OnInit, OnDestroy {
    paciente: any;
    public profesiones$: Observable<any>;
    public opcionesGrupos = [];
    public localidades$: Observable<any>;
    public patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;
    paramsSubscribe: any;
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
    public morbilidades;

    public ciudadano: ICiudadano = {
        id: null,
        fechaRegistro: new Date(),
        documento: '',
        nombre: '',
        apellido: '',
        tieneTramite: true,
        nroTramite: '',
        grupo: undefined,
        sexo: null,
        fechaNacimiento: null,
        localidad: undefined,
        telefono: '',
        email: '',
        cud: '',
        alergia: false,
        condicion: false,
        convaleciente: false,
        vacuna: false,
        plasma: false,
        amamantando: false,
        embarazada: false,
        profesion: '',
        matricula: null,
        establecimiento: '',
        localidadEstablecimiento: undefined,
        relacion: '',
        estado: 'pendiente',
        validado: true,
        diaseleccionados: '',
        recaptcha: '',
        morbilidades: undefined,
        paciente: undefined,
        factorRiesgoEdad: false
    };

    public relacion = null;
    public sexo = null;
    diaSeleccion = null;
    public fechaMaximaNacimiento;
    public fechaMinimaNacimiento;
    public grupoSelected;
    public profesion;

    constructor(
        private plex: Plex,
        private auth: Auth,
        private pacienteService: PacienteService,
        public sanitazer: DomSanitizer,
        private route: ActivatedRoute,
        private router: Router,
        private inscripcionService: InscripcionService,
        private localidadService: LocalidadService,
        private profesionesService: ProfesionService,
        private grupoPoblacionalService: GrupoPoblacionalService,
    ) {

        this.localidades$ = this.localidadService.get({ codigo: 15 }).pipe(
            cache()
        );
        this.profesiones$ = this.profesionesService.get().pipe(
            cache()
        );
    }

    ngOnInit() {
        if (!(this.auth.getPermissions('vacunacion:crear:?').length > 0)) {
            this.router.navigate(['./inicio']);
        }
        this.plex.updateTitle([{
            route: '/vacunacion/listado',
            name: 'VACUNACION'
        }, {
            name: 'Nueva inscripción'
        }
        ]);
        this.paramsSubscribe = this.route.params.subscribe(params => {
            if (params['paciente']) {
                this.seleccionarPaciente(params['paciente']);
            }
        });
    }

    ngOnDestroy() {
        if (this.paramsSubscribe) {
            this.paramsSubscribe.unsubscribe();
        }
    }

    seleccionarPaciente(idPaciente): void {
        this.pacienteService.getById(idPaciente).subscribe(
            paciente => {
                this.paciente = paciente;
                let gruposPosibles = ['personal-salud', 'policia'];
                if (this.paciente.edad > 59) {
                    gruposPosibles.push('mayores60');
                } else {
                    gruposPosibles = gruposPosibles.concat(['factores-riesgo', 'discapacidad', 'sin-factores-riesgo']);
                }
                this.grupoPoblacionalService.search({ nombre: gruposPosibles }).subscribe(grupos => {
                    let grupofr = grupos.find(g => g.nombre === 'factores-riesgo');
                    if (grupofr) {
                        this.morbilidades = grupofr.morbilidades;
                    }
                    this.opcionesGrupos = grupos;
                });
                this.ciudadano.nombre = this.paciente.nombre;
                this.ciudadano.apellido = this.paciente.apellido;
                this.ciudadano.documento = this.paciente.documento;
                this.ciudadano.fechaNacimiento = this.paciente.fechaNacimiento;
                this.ciudadano.sexo = this.paciente.sexo;
                if (this.paciente.contacto.length > 0) {
                    this.paciente.contacto.forEach((contacto) => {
                        if (contacto.tipo === 'celular') {
                            this.ciudadano.telefono = contacto.valor;
                        }
                        if (contacto.tipo === 'email') {
                            this.ciudadano.email = contacto.valor;
                        }
                    });
                }
                if (this.paciente.direccion && this.paciente.direccion.length > 0) {
                    this.ciudadano.localidad = this.paciente.direccion[0].ubicacion.localidad;
                    this.ciudadano.validaciones = ['domicilio'];
                }
                this.ciudadano.paciente = this.paciente;
            },
            () => {
                this.plex.info('danger', 'Intente nuevamente', 'Error en la búsqueda de paciente');
                this.router.navigate(['/vacunacion/listado']);
            }
        );
    }

    setFactorRiesgoEdad() {
        this.grupoPoblacionalService.cumpleExcepciones(this.ciudadano.grupo.nombre, { paciente: JSON.stringify({ id: this.paciente.id }) }).subscribe(resultado => {
            this.ciudadano.factorRiesgoEdad = resultado;
        });
    }

    guardarInscripcion($event) {
        if ($event.formValid) {
            this.inscripcionService.get({
                fields: '-nroTramite',
                documento: this.ciudadano.documento,
                sexo: this.ciudadano.sexo
            }).subscribe(resultado => {
                if (resultado.length) {
                    this.plex.info('danger', 'Ya existe una inscripción activa para el paciente seleccionado');
                } else {
                    if (this.ciudadano.grupo.nombre === 'factores-riesgo') {
                        this.ciudadano.morbilidades = this.ciudadano.morbilidades ? this.ciudadano.morbilidades.map(c => c.id) : [];
                    } else {
                        this.ciudadano.morbilidades = [];
                    }
                    this.ciudadano.diaseleccionados = this.diaSeleccion ? this.diaSeleccion.id : '';
                    this.inscripcionService.create(this.ciudadano).subscribe(respuesta => {
                        this.router.navigate(['/vacunacion/listado']);
                        this.plex.toast('success', 'Inscripción guardada', 'Éxito', 4000);
                    });
                }
            });
        } else {
            this.plex.info('danger', 'Debe completar los datos requeridos');
        }
    }

    cancelar() {
        this.router.navigate(['/vacunacion/listado']);
    }
}
