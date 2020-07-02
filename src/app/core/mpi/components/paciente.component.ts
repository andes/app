import { AppMobileService } from '../../../services/appMobile.service';
import { ParentescoService } from '../../../services/parentesco.service';
import { IContacto } from '../../../interfaces/IContacto';
import { IDireccion } from '../interfaces/IDireccion';
import { PacienteService } from '../services/paciente.service';
import { IPaciente } from '../interfaces/IPaciente';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PacienteCacheService } from '../services/pacienteCache.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HistorialBusquedaService } from '../services/historialBusqueda.service';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { Subscription } from 'rxjs';
import { PacienteHttpService } from '../services/pacienteHttp.service';
import { RelacionesPacientesComponent } from './relaciones-pacientes.component';
import { DatosContactoComponent } from './datos-contacto.component';

@Component({
    selector: 'paciente',
    templateUrl: 'paciente.html',
    styleUrls: ['paciente.scss']
})
export class PacienteComponent implements OnInit {

    @ViewChild('relaciones', null) relaciones: RelacionesPacientesComponent;
    @ViewChild('datosContacto', null) datosContacto: DatosContactoComponent;

    mainSize = 10;  // tamaño de layout-main
    detailDirection = 'column'; // estilo de paciente-panel
    tabIndex = 0;
    showRelaciones = false; // en paciente-panel (sidebar)
    parentescoModel: any[];
    relacionesBorradas: any[];
    backUpDatos = [];
    pacientesSimilares = [];
    datosBasicosValid: Boolean = false;
    datosContactosValid: Boolean = false;

    validado = false;
    disableGuardar = true;
    visualizarIgnorarGuardar = false;
    disableIgnorarGuardar = false;
    sugerenciaAceptada = false;
    entidadValidadora = '';

    changeRelaciones = false;
    posibleDuplicado = false;
    loading = true;
    autoFocus = 0;

    public contacto: IContacto = {
        tipo: 'celular',
        valor: '',
        ranking: 0,
        activo: true,
        ultimaActualizacion: new Date()
    };

    public direccion: IDireccion = {
        valor: '',
        codigoPostal: '',
        ubicacion: {
            pais: null,
            provincia: null,
            localidad: null,
            barrio: null,
        },
        ranking: 0,
        geoReferencia: null,
        ultimaActualizacion: new Date(),
        activo: true
    };

    public pacienteModel: IPaciente = {
        id: null,
        documento: '',
        cuil: null,
        activo: true,
        estado: 'temporal',
        nombre: '',
        apellido: '',
        nombreCompleto: '',
        alias: '',
        contacto: [this.contacto],
        sexo: undefined,
        genero: undefined,
        fechaNacimiento: null, // Fecha Nacimiento
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        edad: null,
        edadReal: null,
        fechaFallecimiento: null,
        direccion: [this.direccion],
        estadoCivil: undefined,
        foto: null,
        relaciones: null,
        financiador: [null],
        identificadores: null,
        claveBlocking: null,
        entidadesValidadoras: [this.entidadValidadora],
        scan: null,
        reportarError: false,
        notaError: '',
        vinculos: [null]
    };

    public pacientes: IPacienteMatch[] | IPaciente[];
    public disableValidar = true;
    public escaneado = false;
    public paciente: IPaciente;
    public showDeshacer = false;
    private subscripcionValidar: Subscription = null;

    // // PARA LA APP MOBILE
    public showMobile = false;
    public checkPass = false;
    public emailAndes: String = '';
    public messageApp: String = '';
    public celularAndes: String = '';
    public activarApp = false;

    origen = '';
    tipoPaciente = '';
    contactoImportado = false;
    direccionImportada = false;

    constructor(
        private historialBusquedaService: HistorialBusquedaService,
        private pacienteService: PacienteService,
        //     private pacienteHttpService: PacienteHttpService,
        private parentescoService: ParentescoService,
        public appMobile: AppMobileService,
        private pacienteCache: PacienteCacheService,
        private _router: Router,
        public plex: Plex,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.updateTitle('Registrar un paciente');
        this.route.params.subscribe(params => {
            this.origen = params['origen'];
            this.tipoPaciente = params['opcion'] ? params['opcion'] : '';
        });
        this.paciente = this.pacienteCache.getPacienteValor();
        this.escaneado = this.pacienteCache.getScanState();
        this.pacienteCache.clearPaciente();
        this.pacienteCache.clearScanState();
        this.relacionesBorradas = [];
        this.parentescoService.get().subscribe(resultado => {
            this.parentescoModel = resultado;
        });
        this.loadPaciente();
    }


    private loadPaciente() {
        if (this.paciente) {

            if (this.paciente.id) {
                /* El paciente se agrega al historial de búsqueda sólo si ya existía */
                this.historialBusquedaService.add(this.paciente);
                // Busco el paciente en mongodb
                this.pacienteService.getById(this.paciente.id).subscribe(resultado => {
                    if (resultado) {
                        if (!resultado.scan) {
                            resultado.scan = this.paciente.scan;
                        }
                        if (this.escaneado && resultado.estado !== 'validado') {
                            resultado.nombre = this.paciente.nombre.toUpperCase();
                            resultado.apellido = this.paciente.apellido.toUpperCase();
                            resultado.fechaNacimiento = this.paciente.fechaNacimiento;
                            resultado.sexo = this.paciente.sexo;
                            resultado.documento = this.paciente.documento;
                        }
                        this.paciente = Object.assign({}, resultado);
                        this.loading = false;
                    }
                    this.actualizarDatosPaciente();
                    this.loading = false;
                }, error => {
                    this.loading = false;
                    this._router.navigate(['apps/mpi/busqueda']);
                });
            } else {
                if (this.escaneado) {
                    this.pacienteModel.nombre = this.paciente.nombre.toUpperCase();
                    this.pacienteModel.apellido = this.paciente.apellido.toUpperCase();
                    this.pacienteModel.fechaNacimiento = moment(this.paciente.fechaNacimiento).toDate();
                    this.pacienteModel.sexo = this.paciente.sexo;
                    this.pacienteModel.documento = this.paciente.documento;
                    this.pacienteModel.estado = 'validado';
                    this.paciente = Object.assign({}, this.pacienteModel);
                    this.actualizarDatosPaciente();
                    this.loading = false;
                }
            }
        } else {
            this.loading = false;
        }
    }

    private updateTitle(nombre: string) {
        this.plex.updateTitle('MPI / ' + nombre);
        this.plex.updateTitle([{
            route: 'apps/mpi/busqueda',
            name: 'MPI'
        }, {
            name: nombre
        }]);
    }

    // ---------------- PACIENTE -----------------------

    onSelect(paciente: IPaciente) {
        this.showDeshacer = false;
        this.paciente = Object.assign({}, paciente);
        this.actualizarDatosPaciente();
        this.disableGuardar = false;
        this.visualizarIgnorarGuardar = false;
        this.sugerenciaAceptada = true;
        this.pacientesSimilares = [];
    }

    actualizarDatosPaciente() {
        if (this.escaneado) {
            this.validado = true;
            this.paciente.estado = 'validado';
            if (this.paciente.entidadesValidadoras) {
                if (this.paciente.entidadesValidadoras.length <= 0) {
                    // Caso que el paciente existe y no tiene ninguna entidad validadora e ingresó como validado
                    this.paciente.entidadesValidadoras.push('RENAPER');
                } else {
                    let validador = this.paciente.entidadesValidadoras.find(entidad => entidad === 'RENAPER');
                    if (!validador) {
                        this.paciente.entidadesValidadoras.push('RENAPER');
                    }
                }
            } else {
                // El caso que el paciente no existe
                this.paciente.entidadesValidadoras = ['RENAPER'];
            }
        } else {
            if (this.paciente.estado !== 'validado') {
                this.validado = false;
                this.paciente.estado = 'temporal';
            } else {
                this.validado = true;
            }
        }
        if (!this.paciente.contacto || !this.paciente.contacto.length) {
            this.paciente.contacto = [this.contacto];
        }
        this.pacienteModel = Object.assign({}, this.paciente);

        if (this.pacienteModel.fechaNacimiento) {
            this.pacienteModel.fechaNacimiento = moment(this.pacienteModel.fechaNacimiento).add(3, 'h').toDate(); // mers alert
        }
        this.pacienteModel.genero = this.pacienteModel.genero ? this.pacienteModel.genero : this.pacienteModel.sexo;
        this.checkDisableValidar();

        // Se piden los datos para app mobile en la 1er carga del paciente
        if (!this.paciente.id) {
            this.checkPass = true;
            this.activarApp = true;
        }
    }


    save(event, ignoreCheck = false) {
        if (!event.formValid) {
            this.plex.info('warning', 'Debe completar los datos obligatorios');
            return;
        }
        this.disableIgnorarGuardar = ignoreCheck;
        this.disableGuardar = true;
        let pacienteGuardar: any = Object.assign({}, this.pacienteModel);
        pacienteGuardar.ignoreCheck = ignoreCheck;
        pacienteGuardar.sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
        pacienteGuardar.estadoCivil = this.pacienteModel.estadoCivil ? ((typeof this.pacienteModel.estadoCivil === 'string')) ? this.pacienteModel.estadoCivil : (Object(this.pacienteModel.estadoCivil).id) : null;
        pacienteGuardar.genero = this.pacienteModel.genero ? ((typeof this.pacienteModel.genero === 'string')) ? this.pacienteModel.genero : (Object(this.pacienteModel.genero).id) : pacienteGuardar.sexo;
        pacienteGuardar.contacto.map(elem => {
            elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
            return elem;
        });

        this.pacienteService.save(pacienteGuardar, ignoreCheck = false).subscribe(
            (resultadoSave: any) => {
                // Existen sugerencias de pacientes similares?
                if (resultadoSave.resultadoMatching && resultadoSave.resultadoMatching.length > 0) {
                    this.pacientesSimilares = this.escaneado ? resultadoSave.resultadoMatching.filter(elem => elem.paciente.estado === 'validado') : resultadoSave.resultadoMatching;
                    // Si el matcheo es alto o el dni-sexo está repetido no podemos ignorar las sugerencias
                    this.visualizarIgnorarGuardar = !resultadoSave.macheoAlto && !resultadoSave.dniRepetido;
                    if (!this.visualizarIgnorarGuardar) {
                        this.plex.info('danger', 'El paciente ya existe, verifique las sugerencias');
                    } else {
                        this.plex.info('warning', 'Existen pacientes similares, verifique las sugerencias');
                    }
                } else {
                    if (this.changeRelaciones) {
                        this.saveRelaciones(resultadoSave);
                    }
                    this.historialBusquedaService.add(resultadoSave);
                    this.plex.info('success', 'Los datos se actualizaron correctamente');

                    this.redirect(resultadoSave);
                }
            },
            error => {
                this.plex.info('warning', 'Error guardando el paciente');
            }
        );
    }

    private redirect(resultadoSave?: any) {
        switch (this.origen) {
            case 'puntoInicio':
                if (resultadoSave) {
                    this._router.navigate(['citas/punto-inicio/' + resultadoSave.id]);
                } else {
                    this._router.navigate(['citas/punto-inicio/']);
                }
                break;
            case 'mpi':
                this._router.navigate(['apps/mpi/busqueda']);
                break;
            case 'sobreturno':
                this._router.navigate(['citas/gestor_agendas']);
                break;
            default:
                this._router.navigate(['apps/mpi/busqueda']);
                break;
        }

    }

    // Borra/agrega relaciones al paciente segun corresponda.
    saveRelaciones(unPacienteSave) {
        if (unPacienteSave) {
            // Borramos relaciones
            if (this.relacionesBorradas.length > 0) {
                this.relacionesBorradas.forEach(rel => {
                    let relacionOpuesta = this.parentescoModel.find((elem) => {
                        if (elem.nombre === rel.relacion.opuesto) {
                            return elem;
                        }
                    });
                    let dto = {
                        relacion: relacionOpuesta,
                        referencia: unPacienteSave.id,
                    };
                    if (rel.referencia) {
                        this.pacienteService.patch(rel.referencia, {
                            'op': 'deleteRelacion',
                            'dto': dto
                        }).subscribe();
                    }
                });
            }
            // agregamos las relaciones opuestas
            if (unPacienteSave.relaciones && unPacienteSave.relaciones.length > 0) {
                unPacienteSave.relaciones.forEach(rel => {
                    let relacionOpuesta = this.parentescoModel.find((elem) => {
                        if (elem.nombre === rel.relacion.opuesto) {
                            return elem;
                        }
                    });
                    let dto = {
                        relacion: relacionOpuesta,
                        referencia: unPacienteSave.id,
                        nombre: unPacienteSave.nombre,
                        apellido: unPacienteSave.apellido,
                        documento: unPacienteSave.documento,
                        foto: unPacienteSave.foto ? unPacienteSave.foto : null
                    };
                    if (dto.referencia) {
                        this.pacienteService.patch(rel.referencia, {
                            'op': 'updateRelacion',
                            'dto': dto
                        }).subscribe();
                    }
                });
            }
        }
    }

    activarAppMobile(unPaciente: IPaciente) {
        // Activa la app mobile
        if (this.activarApp && this.emailAndes && this.celularAndes) {
            this.appMobile.create(unPaciente.id, {
                email: this.emailAndes,
                telefono: this.celularAndes
            }).subscribe((datos) => {
                if (datos.error) {
                    if (datos.error === 'email_not_found') {
                        this.plex.info('El paciente no tiene asignado un email.', 'Atención');
                    }
                    if (datos.error === 'email_exists') {
                        this.plex.info('El mail ingresado ya existe, ingrese otro email', 'Atención');
                    }
                } else {
                    this.plex.info('success', 'Se ha enviado el código de activación al paciente');
                }
            });
        }
    }

    gestionMobile(band) {
        this.showMobile = band;
    }

    cancel() {
        if (this.subscripcionValidar) {
            this.subscripcionValidar.unsubscribe();
        }
        this.showMobile = false;
        this.redirect();
    }

    checkTabs(tabIndex) {
        if (tabIndex === 1) {
            this.datosContacto.refreshMap();
        }
        if (tabIndex === 2) {
            // tab relaciones
            this.mainSize = 8;
            this.detailDirection = 'row';
            this.showRelaciones = true;
        } else {
            this.mainSize = 10;
            this.detailDirection = 'column';
            this.showRelaciones = false;
        }
    }

    // ---------------- NOTIFICACIONES --------------------

    datosBasicosForm(data) {
        this.datosBasicosValid = data.isValid;  // formulario valido
        this.disableGuardar = !(this.datosContactosValid && this.datosBasicosValid);
        this.checkDisableValidar();

        if (data.refreshData) {
            this.datosContacto.refreshVars();
        }
    }

    datosContactoForm(data) {
        this.datosContactosValid = data.isValid;    // formulario valido
        this.disableGuardar = !(this.datosContactosValid && this.datosBasicosValid);
    }

    notasNotification(notasNew) {
        this.pacienteModel.notas = notasNew;
    }


    actualizarRelaciones(data: any) {
        this.changeRelaciones = true;
        this.pacienteModel.relaciones = data.relaciones;
        this.relacionesBorradas = data.relacionesBorradas;
    }


    checkDisableValidar() {
        if (!this.validado || !this.pacienteModel.foto) {
            let sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
            this.disableValidar = !(parseInt(this.pacienteModel.documento, 0) >= 99999 && sexo !== undefined && sexo !== 'otro');
        }
    }

    toRelacionesOnChange(data) {
        this.relaciones.onChange(data);
    }

    // ---------------------------------------------------

    validarPaciente() {
        if (!this.pacienteModel.documento && this.pacienteModel.sexo) {
            this.plex.info('warning', 'La validación requiere ingresar documento y sexo..');
            return;
        }

        let sexoPaciente = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
        if (sexoPaciente === 'otro') {
            this.plex.info('warning', 'La validación requiere sexo MASCULINO o FEMENINO.', 'Atención');
            return;
        }
        this.disableValidar = true;
        this.loading = true;

        if (this.subscripcionValidar) {
            this.subscripcionValidar.unsubscribe();
        }
        this.subscripcionValidar = this.pacienteService.validar(this.pacienteModel).subscribe(
            resultado => {
                this.loading = false;
                if (resultado.existente) {
                    // PACIENTE EXISTENTE EN ANDES
                    if (resultado.paciente.estado === 'validado') {
                        this.validado = true;
                    }
                    this.plex.info('info', 'El paciente que está cargando ya existe en el sistema', 'Atención');
                    this.pacienteModel = resultado.paciente;
                } else if (resultado.validado) {
                    // VALIDACION MEDIANTE FUENTES AUTENTICAS EXITOSA
                    this.setBackup();
                    this.validado = true;
                    this.showDeshacer = true;
                    this.pacienteModel.nombre = resultado.paciente.nombre;
                    this.pacienteModel.apellido = resultado.paciente.apellido;
                    this.pacienteModel.estado = resultado.paciente.estado;
                    this.pacienteModel.fechaNacimiento = moment(resultado.paciente.fechaNacimiento).add(4, 'h').toDate(); // mas mers alert
                    this.pacienteModel.foto = resultado.paciente.foto;
                    //  Se completan datos FALTANTES
                    if (!this.pacienteModel.direccion[0].valor && resultado.paciente.direccion && resultado.paciente.direccion[0].valor) {
                        this.pacienteModel.direccion[0].valor = resultado.paciente.direccion[0].valor;
                    }
                    if (!this.pacienteModel.direccion[0].codigoPostal && resultado.paciente.cpostal) {
                        this.pacienteModel.direccion[0].codigoPostal = resultado.paciente.cpostal;
                    }
                    if (resultado.paciente.direccion[1]) {  // direccion legal
                        this.pacienteModel.direccion[1] = resultado.paciente.direccion[1];
                    }
                    if (!this.pacienteModel.cuil && resultado.paciente.cuil) {
                        this.pacienteModel.cuil = resultado.paciente.cuil;
                    }
                    this.plex.toast('success', '¡Paciente Validado!');
                } else {
                    this.plex.toast('danger', 'Validación Fallida');
                    this.disableValidar = false;
                }
            },
            () => {
                this.loading = false;
                this.plex.toast('danger', 'Validación Fallida');
                this.disableValidar = false;
            }
        );
    }

    private setBackup() {
        this.backUpDatos['nombre'] = this.pacienteModel.nombre;
        this.backUpDatos['apellido'] = this.pacienteModel.apellido;
        this.backUpDatos['estado'] = this.pacienteModel.estado;
        this.backUpDatos['genero'] = this.pacienteModel.genero;
        this.backUpDatos['fechaNacimiento'] = this.pacienteModel.fechaNacimiento;
        this.backUpDatos['foto'] = this.pacienteModel.foto;
        this.backUpDatos['cuil'] = this.pacienteModel.cuil;
        if (this.pacienteModel.direccion) {
            this.backUpDatos['direccion'] = this.pacienteModel.direccion[0].valor;
            this.backUpDatos['codigoPostal'] = this.pacienteModel.direccion[0].codigoPostal;
        }
    }

    deshacerValidacion() {
        this.showDeshacer = false;
        this.pacienteModel.foto = this.backUpDatos['foto'];
        this.pacienteModel.direccion[0].valor = this.backUpDatos['direccion'];
        this.pacienteModel.direccion[0].codigoPostal = this.backUpDatos['codigoPostal'];

        if (this.backUpDatos['estado'] === 'temporal') {
            this.pacienteModel.nombre = this.backUpDatos['nombre'];
            this.pacienteModel.apellido = this.backUpDatos['apellido'];
            this.pacienteModel.fechaNacimiento = this.backUpDatos['fechaNacimiento'];
            this.pacienteModel.cuil = this.backUpDatos['cuil'];
            this.pacienteModel.estado = this.backUpDatos['estado'];
            this.pacienteModel.genero = this.backUpDatos['genero'];
            this.validado = false;
        }
        this.disableValidar = false;
        this.pacienteModel.direccion.splice(1);
    }
}