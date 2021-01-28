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
import { RelacionesPacientesComponent } from './relaciones-pacientes.component';
import { DatosContactoComponent } from './datos-contacto.component';
import { DatosBasicosComponent } from './datos-basicos.component';
import { ValidacionService } from 'src/app/services/fuentesAutenticas/validacion.service';
import { Subscription, EMPTY } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Component({
    selector: 'paciente',
    templateUrl: 'paciente.html',
    styleUrls: ['paciente.scss']
})
export class PacienteComponent implements OnInit {

    @ViewChild('relaciones', { static: false }) relaciones: RelacionesPacientesComponent;
    @ViewChild('datosContacto', { static: false }) datosContacto: DatosContactoComponent;
    @ViewChild('datosBasicos', { static: false }) datosBasicos: DatosBasicosComponent;

    mainSize = 10;  // tamaño de layout-main
    detailDirection = 'column'; // estilo de paciente-panel
    tabIndex = 0;
    showRelaciones = false; // en paciente-panel (sidebar)
    parentescoModel: any[];
    relacionesBorradas: any[] = [];
    relacionesEdit: any[] = []; // relaciones nuevas o editadas
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
        fechaFallecimiento: null,
        direccion: [this.direccion],
        estadoCivil: undefined,
        fotoId: null,
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
    public scanCode = null;
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
        private validacionService: ValidacionService,
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
        this.scanCode = this.pacienteCache.getScan();
        this.escaneado = this.scanCode?.length > 0;
        this.pacienteCache.clearPaciente();
        this.pacienteCache.clearScanState();
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
                            resultado.scan = this.scanCode;
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
                    this.pacienteModel.scan = this.paciente.scan;
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
        this.setMainSize(null);
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

        this.pacienteModel.genero = this.pacienteModel.genero ? this.pacienteModel.genero : this.pacienteModel.sexo;
        this.checkDisableValidar();
    }


    save(ignoreSuggestions = false) {
        let contactoValid = this.datosContacto.checkForm();
        let datosBasicosValid = this.datosBasicos.checkForm();
        if (!contactoValid || !datosBasicosValid) {
            this.plex.info('warning', 'Debe completar los datos obligatorios');
            return;
        }
        this.disableIgnorarGuardar = ignoreSuggestions;
        this.disableGuardar = true;
        let pacienteGuardar: any = Object.assign({}, this.pacienteModel);
        pacienteGuardar.ignoreSuggestions = ignoreSuggestions;
        pacienteGuardar.sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
        pacienteGuardar.estadoCivil = this.pacienteModel.estadoCivil ? ((typeof this.pacienteModel.estadoCivil === 'string')) ? this.pacienteModel.estadoCivil : (Object(this.pacienteModel.estadoCivil).id) : null;
        pacienteGuardar.genero = this.pacienteModel.genero ? ((typeof this.pacienteModel.genero === 'string')) ? this.pacienteModel.genero : (Object(this.pacienteModel.genero).id) : pacienteGuardar.sexo;
        pacienteGuardar.tipoIdentificacion = this.pacienteModel.tipoIdentificacion ? ((typeof this.pacienteModel.tipoIdentificacion === 'string')) ? this.pacienteModel.tipoIdentificacion : (Object(this.pacienteModel.tipoIdentificacion).id) : null;
        pacienteGuardar.contacto.map(elem => {
            elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
            return elem;
        });

        this.pacienteService.save(pacienteGuardar).subscribe(
            (resultadoSave: any) => {
                // Existen sugerencias de pacientes similares?
                if (resultadoSave.sugeridos) {
                    this.pacientesSimilares = this.escaneado ? resultadoSave.sugeridos.filter(elem => elem.paciente.estado === 'validado') : resultadoSave.sugeridos;
                    // Si el matcheo es alto o el dni-sexo está repetido no podemos ignorar las sugerencias
                    this.visualizarIgnorarGuardar = resultadoSave.sugeridos[0]._score < 0.94;
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
            this.relacionesBorradas.forEach(rel => {
                if (rel.referencia) {
                    this.pacienteService.getById(rel.referencia).pipe(
                        map(pac => {
                            let index = pac.relaciones?.findIndex((unaRel: any) => unaRel.referencia === unPacienteSave.id);
                            if (index >= 0) {
                                pac.relaciones.splice(index, 1);
                            }
                            return pac;
                        }),
                        mergeMap(pac => {
                            return this.pacienteService.patch(pac.id, { relaciones: pac.relaciones });
                        })
                    ).subscribe();
                }
            });
            // actualizamos/agregamos las relaciones opuestas
            this.relacionesEdit.forEach(rel => {
                let relacionOpuesta = this.parentescoModel.find((elem) => {
                    if (elem.nombre === rel.relacion.opuesto) {
                        return elem;
                    }
                });
                let dto = {
                    id: null,
                    relacion: relacionOpuesta,
                    referencia: unPacienteSave.id,
                    nombre: unPacienteSave.nombre,
                    apellido: unPacienteSave.apellido,
                    documento: (unPacienteSave.documento) ? unPacienteSave.documento : null,
                    numeroIdentificacion: (unPacienteSave.numeroIdentificacion) ? unPacienteSave.numeroIdentificacion : null,
                    foto: unPacienteSave.foto ? unPacienteSave.foto : null,
                    fotoId: unPacienteSave.fotoId ? unPacienteSave.fotoId : null
                };
                if (dto.referencia) {
                    this.pacienteService.getById(rel.referencia).pipe(
                        map(pac => {
                            let index = pac.relaciones?.findIndex((unaRel: any) => unaRel.referencia === unPacienteSave.id);
                            if (index >= 0) {
                                pac.relaciones[index] = dto;
                            } else {
                                pac.relaciones?.length ? pac.relaciones.push(dto) : pac.relaciones = [dto];
                            }
                            return pac;
                        }),
                        mergeMap(pac => {
                            return this.pacienteService.patch(pac.id, { relaciones: pac.relaciones });
                        })
                    ).subscribe();
                }
            });
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
        let sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
        this.disableValidar = !(parseInt(this.pacienteModel.documento, 0) >= 9999 && sexo !== undefined && sexo !== 'otro');
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
        if (data.relacionesBorradas) {
            this.relacionesBorradas = data.relacionesBorradas;
        }
        if (data.relacionesEdit) {
            this.relacionesEdit = data.relacionesEdit;
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

        this.subscripcionValidar = this.pacienteService.get({
            documento: this.pacienteModel.documento,
            sexo: sexoPaciente,
            estado: 'validado',
            activo: true
        }).pipe(
            map((resultado: any) => {
                if (!this.pacienteModel.id) {
                    // Si estamos creando un nuevo paciente, chequeamos si existe un paciente validado con igual documento y sexo
                    if (resultado.length && resultado[0].documento === this.pacienteModel.documento.toString()) {
                        // El paciente que se intenta validar ya existe
                        this.loading = false;
                        this.plex.info('info', 'El paciente que está cargando ya existe en el sistema', 'Atención');
                        this.paciente = resultado[0];
                        this.actualizarDatosPaciente();
                        return true;
                    }
                }
                return false;
            }),
            mergeMap((validado: any) => {
                if (!validado) {
                    // Si no existe un paciente validado similar procedemos a validar
                    return this.validacionService.post({
                        documento: this.pacienteModel.documento,
                        sexo: sexoPaciente
                    }).pipe(
                        map((resultado: any) => {
                            this.loading = false;
                            if (resultado.error) {
                                this.plex.toast('danger', 'Ciudadano no encontrado"');
                                this.disableValidar = false;
                            } else {
                                this.setBackup();
                                this.validado = true;
                                this.showDeshacer = true;
                                if (this.pacienteModel.estado !== 'validado') {
                                    this.pacienteModel.nombre = resultado.nombre;
                                    this.pacienteModel.apellido = resultado.apellido;
                                    this.pacienteModel.estado = resultado.estado;
                                }
                                this.pacienteModel.fechaNacimiento = moment(resultado.fechaNacimiento).toDate();
                                this.pacienteModel.foto = resultado.foto;
                                this.pacienteModel.fotoId = resultado.fotoId;

                                // agregamos en identificadores la validación
                                const resIdentificadores = resultado.identificadores;
                                if (this.pacienteModel.identificadores?.length) {
                                    const posIdentficador = this.pacienteModel.identificadores.findIndex(unId => unId.entidad === resIdentificadores[0].entidad);
                                    if (posIdentficador !== -1) {
                                        // seteo el campo valor por si se modificó
                                        this.pacienteModel.identificadores[posIdentficador].valor = resIdentificadores[0].valor || '';
                                    } else {
                                        this.pacienteModel.identificadores.push(resIdentificadores[0]);
                                    }
                                } else {
                                    this.pacienteModel.identificadores = resIdentificadores || null;
                                }
                                // Fecha de fallecimiento en caso de poseerla
                                if (resultado.fechaFallecimiento) {
                                    this.pacienteModel.fechaFallecimiento = moment(resultado.fechaFallecimiento).toDate();
                                } else {
                                    this.pacienteModel.fechaFallecimiento = null;
                                }
                                //  Se completan datos FALTANTES
                                if (!this.pacienteModel.direccion[0].valor && resultado.direccion && resultado.direccion[0].valor) {
                                    this.pacienteModel.direccion[0].valor = resultado.direccion[0].valor;
                                }
                                if (!this.pacienteModel.direccion[0].codigoPostal && resultado.cpostal) {
                                    this.pacienteModel.direccion[0].codigoPostal = resultado.cpostal;
                                }
                                if (resultado.direccion[1]) {  // direccion legal
                                    this.pacienteModel.direccion[1] = resultado.direccion[1];
                                }
                                if (!this.pacienteModel.cuil && resultado.cuil) {
                                    this.pacienteModel.cuil = resultado.cuil;
                                }
                                this.plex.toast('success', '¡Paciente Validado!');
                            }
                        },  // error
                            () => {
                                this.plex.toast('danger', 'Validación Fallida');
                                this.disableValidar = false;
                            })
                    );
                }
                this.loading = false;
                return EMPTY;
            })
        ).subscribe();
    }

    private setBackup() {
        this.backUpDatos['nombre'] = this.pacienteModel.nombre;
        this.backUpDatos['apellido'] = this.pacienteModel.apellido;
        this.backUpDatos['estado'] = this.pacienteModel.estado;
        this.backUpDatos['genero'] = this.pacienteModel.genero;
        this.backUpDatos['fechaNacimiento'] = this.pacienteModel.fechaNacimiento;
        this.backUpDatos['cuil'] = this.pacienteModel.cuil;
        this.backUpDatos['fechaFallecimiento'] = this.pacienteModel.fechaFallecimiento;
        this.backUpDatos['direccion'] = this.pacienteModel.direccion ? this.pacienteModel.direccion : null;
        this.backUpDatos['foto'] = this.pacienteModel.foto;
        this.backUpDatos['fotoId'] = this.pacienteModel.fotoId;
        this.backUpDatos['identificadores'] = this.pacienteModel.identificadores;
    }

    deshacerValidacion() {
        this.showDeshacer = false;
        this.pacienteModel.direccion = this.backUpDatos['direccion'] ? this.backUpDatos['direccion'] : [this.direccion];
        this.pacienteModel.foto = this.backUpDatos['foto'];
        this.pacienteModel.fotoId = this.backUpDatos['fotoId'];
        this.pacienteModel.identificadores = this.backUpDatos['identificadores'];

        if (this.backUpDatos['estado'] === 'temporal') {
            this.pacienteModel.nombre = this.backUpDatos['nombre'];
            this.pacienteModel.apellido = this.backUpDatos['apellido'];
            this.pacienteModel.fechaNacimiento = this.backUpDatos['fechaNacimiento'];
            this.pacienteModel.cuil = this.backUpDatos['cuil'];
            this.pacienteModel.estado = this.backUpDatos['estado'];
            this.pacienteModel.genero = this.backUpDatos['genero'];
            this.pacienteModel.fechaFallecimiento = this.backUpDatos['fechaFallecimiento'];
            this.validado = false;
        }
        this.disableValidar = false;
        this.pacientesSimilares = [];
        this.visualizarIgnorarGuardar = false;
        this.disableGuardar = false;
        this.checkDisableValidar();
    }
}

