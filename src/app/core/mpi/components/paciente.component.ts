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
import { RelacionesPacientesComponent } from './relaciones-pacientes.component';
import { DatosContactoComponent } from './datos-contacto.component';
import { DatosBasicosComponent } from './datos-basicos.component';

@Component({
    selector: 'paciente',
    templateUrl: 'paciente.html',
    styleUrls: ['paciente.scss']
})
export class PacienteComponent implements OnInit {

    @ViewChild('relaciones', null) relaciones: RelacionesPacientesComponent;
    @ViewChild('datosContacto', null) datosContacto: DatosContactoComponent;
    @ViewChild('datosBasicos', null) datosBasicos: DatosBasicosComponent;

    mainSize = 10;  // tamaño de layout-main
    detailDirection = 'column'; // estilo de paciente-panel
    tabIndex = 0;
    showRelaciones = false; // en paciente-panel (sidebar)
    parentescoModel: any[];
    relacionesBorradas: any[];
    backUpDatos = [];
    pacientesSimilares = [];

    validado = false;
    disableGuardar = false;
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
        tipoIdentificacion: null,
        numeroIdentificacion: null,
        edad: null,
        edadReal: null,
        fechaFallecimiento: undefined,
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

    origen = '';
    tipoPaciente = '';
    contactoImportado = false;
    direccionImportada = false;
    activacionMobilePendiente = null;
    dataMobile;

    constructor(
        private historialBusquedaService: HistorialBusquedaService,
        private pacienteService: PacienteService,
        private parentescoService: ParentescoService,
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
                            resultado.nombre = resultado.nombre.toUpperCase();
                            resultado.apellido = resultado.apellido.toUpperCase();
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
        if (!this.paciente.direccion || !this.paciente.direccion.length) {
            this.paciente.direccion = [this.direccion];
        }
        this.pacienteModel = Object.assign({}, this.paciente);

        if (this.pacienteModel.fechaNacimiento) {
            this.pacienteModel.fechaNacimiento = moment(this.pacienteModel.fechaNacimiento).add(3, 'h').toDate(); // mers alert
        }
        this.pacienteModel.genero = this.pacienteModel.genero ? this.pacienteModel.genero : this.pacienteModel.sexo;
        this.checkDisableValidar();
    }


    save(ignoreCheck = false) {
        let contactoValid = this.datosContacto.checkForm();
        let datosBasicosValid = this.datosBasicos.checkForm();
        if (!contactoValid || !datosBasicosValid) {
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
        pacienteGuardar.tipoIdentificacion = this.pacienteModel.tipoIdentificacion ? ((typeof this.pacienteModel.tipoIdentificacion === 'string')) ? this.pacienteModel.tipoIdentificacion : (Object(this.pacienteModel.tipoIdentificacion).id) : null;
        pacienteGuardar.contacto.map(elem => {
            elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
            return elem;
        });

        this.pacienteService.save(pacienteGuardar, ignoreCheck).subscribe(
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
                    this.setMainSize(null);
                } else {
                    if (this.changeRelaciones) {
                        this.saveRelaciones(resultadoSave);
                    }
                    if (this.activacionMobilePendiente) {
                        this.datosContacto.activarAppMobile(resultadoSave, this.dataMobile);
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
            if (this.relacionesBorradas && this.relacionesBorradas.length) {
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
            if (unPacienteSave.relaciones && unPacienteSave.relaciones.length) {
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
                        documento: (unPacienteSave.documento) ? unPacienteSave.documento : null,
                        numeroIdentificacion: (unPacienteSave.numeroIdentificacion) ? unPacienteSave.numeroIdentificacion : null,
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

    cancel() {
        this.plex.confirm('¿Desea salir sin guardar los datos?', 'Atención').then(confirmacion => {
            if (confirmacion) {
                if (this.subscripcionValidar) {
                    this.subscripcionValidar.unsubscribe();
                }
                this.redirect();
            }
        });
    }

    setMainSize(tabIndex) {
        if (this.pacientesSimilares && this.pacientesSimilares.length) {
            this.mainSize = 9;
            return;
        }
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


    checkDisableValidar() {
        if (!this.validado || !this.pacienteModel.foto) {
            let sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
            this.disableValidar = !(parseInt(this.pacienteModel.documento, 0) >= 99999 && sexo !== undefined && sexo !== 'otro');
        }
    }

    // ---------------- NOTIFICACIONES --------------------

    datosBasicosForm(data) {
        if (data.checkValues) {
            this.checkDisableValidar();
        }
        if (data.refreshData) {
            this.datosContacto.refreshVars();
        }
        if (data.relaciones) {
            this.actualizarRelaciones(data);
        }
    }

    notasNotification(notasNew) {
        this.pacienteModel.notas = notasNew;
    }

    mobileNotification(data) {
        this.dataMobile = data;
        this.activacionMobilePendiente = (data !== null);
    }

    actualizarRelaciones(data: any) {
        this.changeRelaciones = true;
        this.pacienteModel.relaciones = data.relaciones;
        this.relacionesBorradas = data.relacionesBorradas;
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
                    this.pacienteModel.foto = resultado.paciente.foto;
                    if (this.pacienteModel.edad < 5) {
                        let fechaNacimiento = moment(this.pacienteModel.fechaNacimiento).toDate();
                        this.pacienteModel.fechaNacimiento = moment(resultado.paciente.fechaNacimiento).toDate();
                        this.pacienteModel.fechaNacimiento = moment(this.pacienteModel.fechaNacimiento.setHours(fechaNacimiento.getHours(), fechaNacimiento.getMinutes(), 0, 0)).toDate();
                    } else {
                        this.pacienteModel.fechaNacimiento = moment(resultado.paciente.fechaNacimiento).toDate();
                    }
                    // Fecha de fallecimiento en caso de poseerla
                    if (resultado.paciente.fechaFallecimiento) {
                        this.pacienteModel.fechaFallecimiento = moment(resultado.paciente.fechaFallecimiento).add(4, 'h').toDate();
                    }
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
