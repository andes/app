import { Plex } from '@andes/plex';
import { AfterViewInit, AfterViewChecked, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable, Subscription, map } from 'rxjs';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { PacienteBuscarResultado } from '../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { ParentescoService } from '../../../services/parentesco.service';
import * as enumerados from '../../../utils/enumerados';
import { IPaciente } from '../interfaces/IPaciente';
import { PacienteService } from '../services/paciente.service';
import { ConstantesService } from 'src/app/services/constantes.service';
import { Auth } from 'projects/auth/src/lib/auth.service';
@Component({
    selector: 'datos-basicos',
    templateUrl: 'datos-basicos.html',
    styleUrls: ['datos-basicos.scss']
})

export class DatosBasicosComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked {
    @Input() paciente: IPaciente;
    @Input() tipoPaciente = 'con-dni';
    @Output() changes: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('formBasico', { static: false }) formBasico: NgForm;
    @ViewChild('formExtranjero', { static: false }) formExtranjero: NgForm;
    @ViewChild('formGenero', { static: false }) formGenero: NgForm;
    profesionalActual: any;


    formChangesSubscription: Subscription;

    estados = [];
    sexos: any[];
    generos: Observable<any>;
    estadosCiviles: any[];
    tipoIdentificacion: any[];
    noPoseeDNI = false;
    botonRegistroDNI = false;
    pacienteExtranjero: IPaciente;
    pacienteEditado = { nombre: '', apellido: '' };
    public requiereGenero: boolean;
    public nuevoPaciente = false;
    public disableRegistro = false;
    public nombrePattern: string;
    public patronDocumento = /^[1-9]{1}[0-9]{4,7}$/;
    hoy = moment().endOf('day').toDate();
    public reportarError = false;

    // para registro de bebes
    busquedaTutor: IPacienteMatch[] | IPaciente[] = [];
    contactoImportado = false;
    direccionImportada = false;
    parentescoModel: any[];
    showBuscador = true;
    searchClear = true;
    relacionBebe: IPacienteRelacion = {
        id: null,
        relacion: {
            id: '',
            nombre: '',
            opuesto: ''
        },
        referencia: '',
        nombre: '',
        alias: '',
        genero: '',
        numeroIdentificacion: '',
        apellido: '',
        documento: '',
        fechaNacimiento: null,
        fechaFallecimiento: null,
        sexo: '',
        foto: null,
        fotoId: null
    };
    pacienteFallecido: any;
    fechaFallecimientoTemporal: Date = null;
    fallecimientoManual: { registradoPor: { id: string; nombre: string; apellido: string; documento: string; }; registradoEn: Date; };

    

    constructor(
        private plex: Plex,
        private pacienteService: PacienteService,
        private parentescoService: ParentescoService,
        private constantesService: ConstantesService,
        private auth: Auth  

    ) {
        this.nombrePattern = pacienteService.nombreRegEx.source;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.paciente) {
            this.nuevoPaciente = changes.paciente.firstChange || !changes.paciente.currentValue.id;

            if (!changes.paciente.previousValue?.id) {
                this.pacienteExtranjero = Object.assign({}, this.paciente);
            }
        }

        if (!changes.paciente.currentValue.notaError?.length) {
            this.paciente.reportarError = false;
        }

       

         // Si el paciente ya tiene fecha de fallecimiento, el slide queda activado y deshabilitado
    this.pacienteFallecido = !!this.paciente.fechaFallecimiento;

   
    }

    ngAfterViewInit() {
        if (this.formExtranjero) {
            this.formExtranjero.control.valueChanges.subscribe(
                () => {
                    this.changes.emit({ pacienteExtranjero: this.pacienteExtranjero });
                    this.disableRegistro = this.formExtranjero.invalid;
                }
            );
        }
    }

    ngOnInit() {
        if (this.tipoPaciente === 'sin-dni') {
            this.noPoseeDNI = true;
            this.paciente.documento = '';
        }
   

        this.profesionalActual = this.auth.usuario;
        this.sexos = enumerados.getObjSexos();
        this.tipoIdentificacion = enumerados.getObjTipoIdentificacion();

        this.generos = this.constantesService.search({ source: 'mpi:genero' }).pipe(
            map(res => res.map(g => ({ id: g.key, nombre: g.nombre })))
        );
        this.estadosCiviles = enumerados.getObjEstadoCivil();
        this.estados = enumerados.getEstados();
        this.parentescoService.get().subscribe(resultado => {
            this.parentescoModel = resultado;
        });
    }
    ngAfterViewChecked() {
        this.formBasico.control.valueChanges.subscribe(() => {
            this.changes.emit({ datosBasicos: true });
        });
    }

    public checkForm() {
        let requiereActualizarGenero = false;
        if (this.paciente.genero && this.paciente.genero !== this.paciente.sexo && ['femenino', 'masculino', 'otro'].includes(this.paciente.genero)) {
            // Para que pacientes ya existentes con identidad autopercibida especificada con valores viejos actualicen el género
            this.paciente.genero = null;
            this.requiereGenero = true;
            requiereActualizarGenero = true;
        }
        this.formBasico.control.markAllAsTouched();
        this.formGenero.control.markAllAsTouched();
        return this.formBasico.control.valid && this.formGenero.control.valid && !requiereActualizarGenero;
    }

    public checkFormExtranjero() {
        this.formExtranjero.control.markAllAsTouched();
        this.formGenero.control.markAllAsTouched();
        return this.formExtranjero.control.valid && this.formGenero.control.valid;
    }

    checkDisableValidar() {
        this.changes.emit({ checkValues: true });
    }

    get validado() {
        return this.paciente.estado === 'validado';
    }

    limpiarDocumento() {
        if (this.noPoseeDNI) {
            this.paciente.documento = '';
            this.plex.info('warning', 'Recuerde que al guardar un paciente sin el número de documento será imposible realizar validaciones contra fuentes auténticas.');
        }
    }
    mapeoGenero() {
        switch ((this.paciente.sexo as any)?.id) {
            case 'masculino':
                this.generos.subscribe(g => this.paciente.genero = g.find(g2 => g2.id === 'varón'));
                break;
            case 'femenino':
                this.generos.subscribe(g => this.paciente.genero = g.find(g2 => g2.id === 'mujer'));
                break;
            default:
                this.paciente.genero = null;
        }
        this.requiereGenero = this.tipoPaciente === 'extranjero'
            ? ((this.pacienteExtranjero.sexo as any)?.id === 'otro')
            : ((this.paciente.sexo as any)?.id === 'otro');
    }
    completaExtranjero() {
        if (this.tipoPaciente === 'extranjero') {
            this.pacienteExtranjero.genero = this.paciente.genero;
            this.pacienteExtranjero.alias = this.paciente.alias;

            this.paciente.apellido = this.pacienteExtranjero.apellido;
            this.paciente.nombre = this.pacienteExtranjero.nombre;
            this.paciente.sexo = this.pacienteExtranjero.sexo;
            this.paciente.fechaNacimiento = this.pacienteExtranjero.fechaNacimiento;
            this.paciente.tipoIdentificacion = this.pacienteExtranjero.tipoIdentificacion;
            this.paciente.numeroIdentificacion = this.pacienteExtranjero.numeroIdentificacion;
        }
    }

    registrarArgentino() {
        if (this.botonRegistroDNI) {
            this.disableRegistro = false;
            this.formExtranjero.control.markAsPristine();
            this.formExtranjero.control.markAsUntouched();
        }
        this.changes.emit({ registroDNI: this.botonRegistroDNI });
    }

    registrarError() {
        this.pacienteEditado.nombre = this.paciente.nombre;
        this.pacienteEditado.apellido = this.paciente.apellido;
        this.paciente.reportarError = true;
        this.changes.emit({ pacienteError: this.pacienteEditado });
    }
    // --------------  PARA REGISTRO DE BEBES -----------------

    onSearchStart() {
        this.busquedaTutor = null;
    }

    onSearchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
            return;
        }
        this.searchClear = false;
        if (resultado.pacientes.length === 1 && resultado.scan?.length) {
            const pacienteScaneado = resultado.pacientes[0];
            if (!pacienteScaneado.id) {
                pacienteScaneado.estado = 'validado'; // este paciente fue scaneado
                pacienteScaneado.genero = pacienteScaneado.sexo;
                this.plex.showLoader();
                this.pacienteService.save(pacienteScaneado).subscribe(
                    pacGuardado => {
                        this.onPacienteSelected(pacGuardado);
                        this.plex.hideLoader();
                    },
                    () => {
                        this.plex.toast('warning', 'Paciente no guardado', 'Error');
                        this.plex.hideLoader();
                    });
            } else {
                this.onPacienteSelected(pacienteScaneado);
            }
        } else {
            this.busquedaTutor = resultado.pacientes;
        }
    }

    onSearchClear() {
        this.busquedaTutor = [];
        this.searchClear = true;
    }

    onPacienteSelected(pacienteSelected: IPaciente) {
        this.searchClear = true;
        if (pacienteSelected) {
            this.pacienteService.getById(pacienteSelected.id).subscribe(paciente => {
                // Relacionamos al bebe con su progenitor/a
                this.relacionBebe.apellido = paciente.apellido;
                this.relacionBebe.nombre = paciente.nombre;
                this.relacionBebe.alias = paciente.alias;
                this.relacionBebe.genero = paciente.genero;
                this.relacionBebe.documento = paciente.documento;
                this.relacionBebe.numeroIdentificacion = paciente.numeroIdentificacion;
                this.relacionBebe.fechaNacimiento = paciente.fechaNacimiento;
                this.relacionBebe.fechaFallecimiento = paciente.fechaFallecimiento;
                this.relacionBebe.sexo = paciente.sexo;
                this.relacionBebe.fotoId = paciente.fotoId ? paciente.fotoId : null;
                this.relacionBebe.referencia = paciente.id;
                const rel = this.parentescoModel.find((elem) => {
                    if (elem.nombre === 'progenitor/a') {
                        return elem;
                    }
                });
                this.relacionBebe.relacion = rel;
                this.paciente.relaciones = [this.relacionBebe];

                /* Si no se cargó ninguna dirección, tomamos el dato de la madre/padre/tutor */
                this.copiarDireccion(paciente);
                /* Si no se cargó un contacto, tomamos el dato de la madre/padre/tutor */
                this.copiarContacto(paciente);
                this.busquedaTutor = [];
                this.showBuscador = false;
                this.changes.emit({
                    refreshData: true,
                    relaciones: this.paciente.relaciones,
                    relacionesEdit: [this.relacionBebe]
                });
            });
        } else {
            this.plex.info('warning', 'Imposible obtener el paciente seleccionado', 'Error');
        }
    }
    private copiarContacto(paciente: IPaciente) {
        if (!paciente.contacto || !paciente.contacto.length) {
            return;
        }
        if (!this.paciente.contacto[0].valor) {
            this.paciente.contacto[0].valor = paciente.contacto[0].valor;
            this.paciente.contacto[0].tipo = paciente.contacto[0].tipo;
            this.contactoImportado = true;
        }
    }

    private copiarDireccion(tutor: IPaciente) {
        if (!tutor.direccion || !tutor.direccion.length) {
            return;
        }
        if (!this.paciente.direccion[0].valor) {
            this.paciente.direccion[0].valor = tutor.direccion[0].valor;
            this.direccionImportada = true;
        }
        if (!this.paciente.direccion[0].ubicacion.provincia && tutor.direccion[0].ubicacion && tutor.direccion[0].ubicacion.provincia) {
            this.paciente.direccion[0].ubicacion.provincia = tutor.direccion[0].ubicacion.provincia;
            this.direccionImportada = true;
        }
        if (!this.paciente.direccion[0].ubicacion.localidad && tutor.direccion[0].ubicacion.localidad) {
            this.paciente.direccion[0].ubicacion.localidad = tutor.direccion[0].ubicacion.localidad;
            this.direccionImportada = true;
        }
        if (!this.paciente.direccion[0].ubicacion.provincia && !this.paciente.direccion[0].ubicacion.localidad) {
        }
        if (!this.paciente.direccion[0].ubicacion.barrio && tutor.direccion[0].ubicacion.barrio) {
            this.paciente.direccion[0].ubicacion.barrio = tutor.direccion[0].ubicacion.barrio;
            this.direccionImportada = true;
        }
    }

    cambiarRelacion() {
        this.showBuscador = true;
        // si los datos direccion/contacto fueron obtenidos de la relación, se resetean.
        if (this.direccionImportada) {
            this.paciente.direccion[0].valor = '';
            this.paciente.direccion[0].ubicacion.localidad = null;
            this.paciente.direccion[0].ubicacion.provincia = null;
            this.paciente.direccion[0].geoReferencia = null;
            this.direccionImportada = false;
        }
        if (this.contactoImportado) {
            this.paciente.contacto[0].valor = '';
            this.paciente.contacto[0].tipo = 'celular';
            this.contactoImportado = false;
        }
        this.changes.emit({ refreshData: true, relaciones: [] });
    }

    verificarNombreApellido(data) {
        if (data.nombre) {
            this.pacienteEditado.nombre = data.nombre;
        }
        if (data.apellido) {
            this.pacienteEditado.apellido = data.apellido;
        }
        this.changes.emit({ pacienteError: this.pacienteEditado });
    }


guardarFallecimiento() {
    if (this.fechaFallecimientoTemporal) {
        const cambios = {
            fallecimientoManual: {
                fecha: this.fechaFallecimientoTemporal,
                registradoPor: {
                    id: this.profesionalActual.id,
                    nombre: this.profesionalActual.nombre,
                    apellido: this.profesionalActual.apellido,
                    documento: this.profesionalActual.documento
                },
                registradoEn: new Date()
            }
        };

        this.pacienteService.patch(this.paciente.id, cambios).subscribe(() => {
            this.plex.toast('success', 'Fecha de fallecimiento registrada correctamente');
        }, err => {
            this.plex.toast('danger', 'Error al guardar fallecimiento', err?.message || '');
        });
    }
}
}
