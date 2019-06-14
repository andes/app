import { AppMobileService } from './../../../services/appMobile.service';
import { ParentescoService } from './../../../services/parentesco.service';
import { IContacto } from './../../../interfaces/IContacto';
import { IDireccion } from '../../../core/mpi/interfaces/IDireccion';
import { LocalidadService } from './../../../services/localidad.service';
import { ProvinciaService } from './../../../services/provincia.service';
import { PaisService } from './../../../services/pais.service';
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import * as enumerados from './../../../utils/enumerados';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { IProvincia } from './../../../interfaces/IProvincia';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { Component, OnInit } from '@angular/core';
import { PacienteCacheService } from '../services/pacienteCache.service';
import { BarrioService } from '../../../services/barrio.service';
import { Location } from '@angular/common';
import { GeoreferenciaService } from '../services/georeferencia.service';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../services/organizacion.service';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { Router, ActivatedRoute } from '@angular/router';
import { PreviousUrlService } from '../../../services/previous-url.service';
import { HistorialBusquedaService } from '../services/historialBusqueda.service';

@Component({
    selector: 'paciente-cru',
    templateUrl: 'paciente-cru.html',
    styleUrls: ['paciente-cru.scss']
})
export class PacienteCruComponent implements OnInit {

    foto = '';
    estados = [];
    sexos: any[];
    generos: any[];
    estadosCiviles: any[];
    tipoComunicacion: any[];
    parentescoModel: any[];
    relacionesBorradas: any[];
    backUpDatos = [];

    provincias: IProvincia[] = [];
    pacientesSimilares = [];
    barrios: any[] = [];
    localidades: any[] = [];

    paisArgentina = null;
    provinciaActual = null;
    localidadActual = null;
    localidadRequerida = true;
    organizacionActual = null;
    validado = false;
    noPoseeDNI = false;
    noPoseeContacto = false;
    contactosCache = [];
    disableGuardar = false;
    enableIgnorarGuardar = false;
    sugerenciaAceptada = false;
    entidadValidadora = '';
    viveLocActual = false;
    viveProvActual = false;
    changeRelaciones = false;
    posibleDuplicado = false;
    loading = false;
    autoFocus = 0;
    hoy = moment().endOf('day').toDate();
    showCargar: boolean;
    contacto: IContacto = {
        tipo: 'celular',
        valor: '',
        ranking: 0,
        activo: true,
        ultimaActualizacion: new Date()
    };

    direccion: IDireccion = {
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

    pacienteModel: IPaciente = {
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
        financiador: null,
        identificadores: null,
        claveBlocking: null,
        entidadesValidadoras: [this.entidadValidadora],
        scan: null,
        reportarError: false,
        notaError: ''
    };
    public disableValidar = true;
    public escaneado = false;
    public paciente: IPaciente;
    public nombrePattern: string;
    public showDeshacer = false;
    public patronDocumento = /^[1-9]{1}[0-9]{6,7}$/;
    // PARA LA APP MOBILE
    public showMobile = false;
    public checkPass = false;
    public emailAndes: String = '';
    public messageApp: String = '';
    public celularAndes: String = '';
    public activarApp = false;

    // Google map
    geoRefOrganizacion = []; // Coordenadas efector
    geoReferenciaAux = []; // Coordenadas para la vista del mapa.
    infoMarcador: String = null;

    opcion: any;

    constructor(
        private historialBusquedaService: HistorialBusquedaService,
        private previousUrlService: PreviousUrlService,
        private organizacionService: OrganizacionService,
        private auth: Auth,
        private georeferenciaService: GeoreferenciaService,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private barriosService: BarrioService,
        private pacienteService: PacienteService,
        private parentescoService: ParentescoService,
        public appMobile: AppMobileService,
        private pacienteCache: PacienteCacheService,
        private _router: Router,
        public plex: Plex,
        private route: ActivatedRoute) {
        this.nombrePattern = pacienteService.nombreRegEx.source;
    }

    ngOnInit() {
        this.updateTitle('Registrar un paciente');
        this.route.params.subscribe(params => {
            this.opcion = params['opcion'];
            if (!this.opcion) {
                // obtiene el paciente cacheado
                this.paciente = this.pacienteCache.getPacienteValor();
                // consulta a la cache si el paciente fue escaneado o no
                this.escaneado = this.pacienteCache.getScanState();
            }
        });
        if (this.opcion === 'sin-dni') {
            this.noPoseeDNI = true;
            this.pacienteModel.documento = '';
        }
        this.relacionesBorradas = [];
        this.organizacionService.getById(this.auth.organizacion.id).subscribe((org: IOrganizacion) => {
            if (org) {
                this.organizacionActual = org;
                this.provinciaActual = org.direccion.ubicacion.provincia;
                this.localidadActual = org.direccion.ubicacion.localidad;
                this.loadPaciente();
                if (org.direccion.geoReferencia) {
                    this.geoReferenciaAux = org.direccion.geoReferencia;
                } else {
                    this.organizacionService.getGeoreferencia(this.auth.organizacion.id).subscribe(point => {
                        if (point) {
                            this.geoReferenciaAux = [point.lat, point.lng];
                        }
                    });
                }
            }
        });
        // Cargamos todas las provincias
        this.provinciaService.get({}).subscribe(rta => {
            this.provincias = rta;
        });
        // Se cargan los parentescos para las relaciones
        this.parentescoService.get().subscribe(resultado => {
            this.parentescoModel = resultado;
        });
        // Set País Argentina
        this.paisService.get({
            nombre: 'Argentina'
        }).subscribe(arg => {
            this.paisArgentina = arg[0];
        });
        this.showCargar = false;
        this.sexos = enumerados.getObjSexos();
        this.generos = enumerados.getObjGeneros();
        this.estadosCiviles = enumerados.getObjEstadoCivil();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.estados = enumerados.getEstados();

    }

    private loadPaciente() {
        if (this.paciente) {

            if (this.paciente.id) {
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
                    }
                    this.actualizarDatosPaciente();
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
                }
            }
        } else {
            // ubicacion inicial mapa de google cuando no se cargó ningun paciente
            if (this.geoRefOrganizacion) {
                this.geoReferenciaAux = this.geoRefOrganizacion;
            } else {
                this.organizacionService.getGeoreferencia(this.auth.organizacion.id).subscribe(point => {
                    if (point) {
                        this.geoReferenciaAux = [point.lat, point.lng];
                        this.infoMarcador = this.auth.organizacion.nombre;
                    }
                });
            }
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
        this.enableIgnorarGuardar = false;
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

        if (this.paciente.contacto) {
            if (this.paciente.contacto.length <= 0) {
                this.paciente.contacto[0] = this.contacto;
            }
        } else {
            this.paciente.contacto = [this.contacto];
        }

        if (this.paciente.direccion) {
            if (this.paciente.direccion.length <= 0) {
                // Si la dirección existe pero esta vacía, completamos la 1er posición del arreglo con el schema default de dirección
                this.paciente.direccion[0] = this.direccion;
            } else {
                if (this.paciente.direccion[0].ubicacion) {
                    if (this.paciente.direccion[0].ubicacion.provincia) {
                        if (this.provinciaActual) {
                            (this.paciente.direccion[0].ubicacion.provincia.nombre === this.provinciaActual.nombre) ? this.viveProvActual = true : this.viveProvActual = false;
                        }
                        this.loadLocalidades(this.paciente.direccion[0].ubicacion.provincia);
                    }
                    if (this.paciente.direccion[0].ubicacion.localidad) {
                        if (this.localidadActual) {
                            (this.paciente.direccion[0].ubicacion.localidad.nombre === this.localidadActual.nombre) ? this.viveLocActual = true : (this.viveLocActual = false, this.barrios = null);
                        }
                        this.loadBarrios(this.paciente.direccion[0].ubicacion.localidad);
                    }
                }
                if (!this.paciente.reportarError) {
                    this.paciente.reportarError = false;
                }
            }
        } else {
            // Si no tenia dirección se le asigna el arreglo con el schema default
            this.paciente.direccion = [this.direccion];
        }

        this.pacienteModel = Object.assign({}, this.paciente);
        if (this.pacienteModel.fechaNacimiento) {
            this.pacienteModel.fechaNacimiento = moment(this.pacienteModel.fechaNacimiento).add(3, 'h').toDate(); // mers alert
        }
        this.pacienteModel.genero = this.pacienteModel.genero ? this.pacienteModel.genero : this.pacienteModel.sexo;
        this.inicializarMapaDefault();
        this.checkDisableValidar();

        // Se piden los datos para app mobile en la 1er carga del paciente
        if (!this.paciente.id) {
            this.checkPass = true;
            this.activarApp = true;
        }
    }


    // ------------------ DATOS BASICOS -------------------------

    limpiarDocumento() {
        if (this.noPoseeDNI) {
            this.pacienteModel.documento = '';
            this.plex.info('warning', 'Recuerde que al guardar un paciente sin el número de documento será imposible realizar validaciones contra fuentes auténticas.');
        }
    }

    completarGenero() {
        this.pacienteModel.genero = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
    }


    // -------------------- DOMICILIO --------------------------

    loadProvincias(event, pais) {
        if (pais && pais.id) {
            this.provinciaService.get({
                pais: pais.id
            }).subscribe(event.callback);
        }
    }

    loadLocalidades(provincia) {
        this.localidadRequerida = false;
        if (provincia && provincia.id) {
            if (provincia.id === this.provinciaActual.id) {
                this.viveProvActual = true;
            }
            this.localidadService.getXProvincia(provincia.id).subscribe(result => {
                this.localidades = result;
                if (this.localidades && this.localidades.length) {
                    this.localidadRequerida = true;
                }

            });
        }
    }

    loadBarrios(localidad) {
        if (localidad && localidad.id) {
            if (localidad.id === this.localidadActual.id) {
                this.viveLocActual = true;
            }
            this.barriosService.getXLocalidad(localidad.id).subscribe(result => {
                this.barrios = result;
            });
        }
    }

    /**
     * Cambia el estado del plex-bool viveProvActual
     * carga las localidades correspondientes a la provincia del actual
     * @param {any} event
     */
    changeProvActual(event) {
        if (event.value) {
            this.pacienteModel.direccion[0].ubicacion.provincia = this.provinciaActual;
            this.loadLocalidades(this.provinciaActual);
        } else {
            this.viveLocActual = false;
            this.localidades = [];
            this.pacienteModel.direccion[0].ubicacion.provincia = null;
            this.pacienteModel.direccion[0].ubicacion.localidad = null;
            this.pacienteModel.direccion[0].ubicacion.barrio = null;
        }
    }

    /**
     * Cambia el estado del plex-bool viveLocActual
     * carga los barrios de la provincia del actual
     * @param {any} event
     *
     * @memberOf PacienteCreateUpdateComponent
     */
    changeLocalidadActual(event) {
        if (event.value) {
            this.pacienteModel.direccion[0].ubicacion.localidad = this.localidadActual;
            this.loadBarrios(this.localidadActual);
        } else {
            this.pacienteModel.direccion[0].ubicacion.localidad = null;
            this.pacienteModel.direccion[0].ubicacion.barrio = null;
            this.barrios = [];
        }
    }

    inicializarMapaDefault() {
        // ubicacion inicial mapa de google
        if (this.pacienteModel.direccion[0].geoReferencia) {
            this.geoReferenciaAux = this.pacienteModel.direccion[0].geoReferencia;
            this.infoMarcador = null;
        } else {
            if (this.geoRefOrganizacion) {
                this.geoReferenciaAux = this.geoRefOrganizacion;
            } else {
                this.organizacionService.getGeoreferencia(this.auth.organizacion.id).subscribe(point => {
                    if (point) {
                        this.geoReferenciaAux = [point.lat, point.lng];
                        this.infoMarcador = this.auth.organizacion.nombre;
                    }
                });
            }
        }
    }

    actualizarMapa() {
        // campos de direccion completos?
        if (this.pacienteModel.direccion[0].valor && this.pacienteModel.direccion[0].ubicacion.provincia && this.pacienteModel.direccion[0].ubicacion.localidad) {
            let direccionCompleta = this.pacienteModel.direccion[0].valor + ', ' + this.pacienteModel.direccion[0].ubicacion.localidad.nombre
                + ', ' + this.pacienteModel.direccion[0].ubicacion.provincia.nombre;
            // se calcula nueva georeferencia
            this.georeferenciaService.getGeoreferencia({ direccion: direccionCompleta }).subscribe(point => {
                if (point) {
                    this.geoReferenciaAux = [point.lat, point.lng]; // se actualiza vista de mapa
                    this.pacienteModel.direccion[0].geoReferencia = [point.lat, point.lng]; // Se asigna nueva georeferencia al paciente
                    this.infoMarcador = '';
                } else {
                    this.plex.toast('warning', 'Dirección no encontrada. Señale manualmente en el mapa.');
                }
            });
        } else {
            this.plex.toast('info', 'Debe completar datos del domicilio.');
        }
    }

    // ---------------------- CONTACTOS ---------------------------

    addContacto(key, valor) {
        let indexUltimo = this.pacienteModel.contacto.length - 1;

        if (this.pacienteModel.contacto[indexUltimo].valor) {
            let nuevoContacto = Object.assign({}, {
                tipo: key,
                valor: valor,
                ranking: 0,
                activo: true,
                ultimaActualizacion: new Date()
            });

            this.pacienteModel.contacto.push(nuevoContacto);
        } else {
            this.plex.toast('info', 'Debe completar los contactos anteriores.');
        }
    }

    removeContacto(i) {
        if (i >= 0) {
            this.pacienteModel.contacto.splice(i, 1);
        }
    }

    // Guarda los contactos cuando se tilda "no posee contactos", para recuperarlos en caso de destildar el box.
    limpiarContacto() {
        if (this.noPoseeContacto) {
            this.contactosCache = this.pacienteModel.contacto;
            this.pacienteModel.contacto = [this.contacto];
        } else {
            this.pacienteModel.contacto = this.contactosCache;
        }
    }

    verificarCorreoValido(indice, form) {
        let formato = /^[a-zA-Z0-9_.+-]+\@[a-zA-Z0-9-]+(\.[a-z]{2,4})+$/;
        let mail = String(this.pacienteModel.contacto[indice].valor);
        form.form.controls['valor-' + indice].setErrors(null);  // con cada caracter nuevo 'limpia' el error y reevalúa
        window.setTimeout(() => {
            if (mail) {
                if (formato.test(mail)) {
                    form.form.controls['valor-' + indice].setErrors(null);
                } else {
                    form.form.controls['valor-' + indice].setErrors({ invalid: true, pattern: { requiredPattern: formato } });

                }
            }
        }, 500);
    }

    onFocusout(type, value) {

        let item = null;
        for (let elem of this.pacienteModel.contacto) {
            if (elem.tipo === type || elem.valor === value) {
                item = elem;
            }
        }
        if (!item) {
            this.addContacto(type, value);
        } else {
            if (!item.valor) {
                item.valor = value;
            } else if (item.valor !== value) {
                this.addContacto(type, value);
            }
        }
    }

    // ------------------------------------------------------------------


    save(event, ignoreCheck = false) {
        if (!event.formValid) {
            this.plex.info('warning', 'Debe completar los datos obligatorios');
            return;
        }
        let faltaParentezco = null;
        if (this.pacienteModel.relaciones && this.pacienteModel.relaciones.length) {
            // Buscamos relaciones declaradas sin especificar tipo de relación
            faltaParentezco = this.pacienteModel.relaciones.find(unaRelacion => unaRelacion.relacion === null);
        }
        // Existen relaciones sin especificar el tipo?
        if (faltaParentezco) {
            this.plex.info('warning', 'Existen relaciones sin parentezco. Completelas antes de guardar', 'Atención');
        } else {
            this.pacienteCache.setScanState(false);
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
            pacienteGuardar.direccion[0].ubicacion.pais = this.paisArgentina;
            if (this.viveProvActual) {
                pacienteGuardar.direccion[0].ubicacion.provincia = this.provinciaActual;
            }
            if (this.viveLocActual) {
                pacienteGuardar.direccion[0].ubicacion.localidad = this.localidadActual;
            }

            this.pacienteService.save(pacienteGuardar, ignoreCheck).subscribe(
                (resultadoSave: any) => {
                    // Existen sugerencias de pacientes similares?
                    if (resultadoSave.resultadoMatching && resultadoSave.resultadoMatching.length > 0) {
                        this.pacientesSimilares = this.escaneado ? resultadoSave.resultadoMatching.filter(elem => elem.paciente.estado === 'validado') : resultadoSave.resultadoMatching;
                        // Si el matcheo es alto o el dni-sexo está repetido no podemos ignorar las sugerencias
                        this.enableIgnorarGuardar = !resultadoSave.macheoAlto && !resultadoSave.dniRepetido;
                        if (!this.enableIgnorarGuardar) {
                            this.plex.info('danger', 'El paciente ya existe, verifique las sugerencias');
                        } else {
                            this.plex.info('warning', 'Existen pacientes similares, verifique las sugerencias');
                        }
                    } else {
                        if (this.changeRelaciones) {
                            this.saveRelaciones(resultadoSave);
                        }
                        if (this.escaneado) {
                            // Si el paciente fue escaneado se agrega al historial de búsqueda
                            this.historialBusquedaService.add(resultadoSave);
                        }
                        this.plex.info('success', 'Los datos se actualizaron correctamente');
                        // TODO: Esto es un poco hacky -- soluciona el problema de tener la url anterior
                        // hasta la actualización a Angular 7.2, donde se incorpora la posibilidad de pasar un estado en el navigate
                        let previousUrl = this.previousUrlService.getUrl();
                        if (previousUrl && previousUrl.includes('citas/punto-inicio')) {
                            this.previousUrlService.setUrl('');
                            this._router.navigate(['citas/punto-inicio/' + resultadoSave.id]);
                        } else {
                            this._router.navigate(['apps/mpi/busqueda']);
                        }
                    }
                },
                error => {
                    this.plex.info('warning', 'Error guardando el paciente');
                }
            );
            this.pacienteCache.clearPaciente();
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

    activarAppMobile(unPaciente) {
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
        if (this.escaneado && this.paciente.id) {
            /* El paciente escaneado se agrega al historial de búsqueda sólo si ya existía.
            De lo contrario se estaría agregando un paciente que no se terminó de registrar. */
            this.historialBusquedaService.add(this.paciente);
        }
        this.showMobile = false;
        this.pacienteCache.clearPaciente();
        this.pacienteCache.clearScanState();
        let previousUrl = this.previousUrlService.getUrl();
        if (previousUrl && previousUrl.includes('citas/punto-inicio')) {
            this.previousUrlService.setUrl('');
            this._router.navigate(['citas/punto-inicio/']);
        } else {
            this._router.navigate(['apps/mpi/busqueda']);
        }
    }

    // ---------------- NOTIFICACIONES --------------------

    renaperNotification(event) {
        this.validado = event;
    }

    notasNotification(notasNew) {
        this.pacienteModel.notas = notasNew;
    }


    actualizarRelaciones(data: any) {
        this.changeRelaciones = true;
        this.pacienteModel.relaciones = data.relaciones;
        this.relacionesBorradas = data.relacionesBorradas;
    }

    changeCoordenadas(coordenadas) {
        this.geoReferenciaAux = coordenadas;    // Se actualiza vista del mapa
        this.pacienteModel.direccion[0].geoReferencia = coordenadas;    // Se asigna nueva georeferencia al paciente
    }


    checkDisableValidar() {
        if (!this.validado || !this.pacienteModel.foto) {
            let sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
            this.disableValidar = !(parseInt(this.pacienteModel.documento, 0) >= 99999 && sexo !== undefined && sexo !== 'otro');
        }
    }

    validarPaciente(event) {
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
        this.pacienteService.validar(this.pacienteModel).subscribe(
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
    }

}
