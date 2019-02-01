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
import { Component, OnInit, } from '@angular/core';
import { PacienteCacheService } from '../services/pacienteCache.service';
import { BarrioService } from '../../../services/barrio.service';
import { Location } from '@angular/common';
import { GeoReferenciaService } from '../services/geoReferencia.service';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../services/organizacion.service';

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
    barrios: any[];
    localidades: any[] = [];

    paisArgentina = null;
    provinciaNeuquen = null;
    localidadNeuquen = null;
    validado = false;
    noPoseeDNI = false;
    noPoseeContacto = false;
    contactosCache = [];
    disableGuardar = false;
    enableIgnorarGuardar = false;
    sugerenciaAceptada = false;
    entidadValidadora = '';
    viveEnNeuquen = false;
    viveProvNeuquen = false;
    changeRelaciones = false;
    posibleDuplicado = false;
    loading = false;
    esEscaneado = false;
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
    public disableValidar = false;
    public escaneado = false;
    public paciente: IPaciente;
    public nombrePattern: string;
    public showDeshacer = false;
    // PARA LA APP MOBILE
    public showMobile = false;
    public checkPass = false;
    public emailAndes: String = '';
    public messageApp: String = '';
    public celularAndes: String = '';
    public activarApp = false;

    // Google map
    geoReferenciaAux = []; // Se utiliza para chequear cambios.
    infoMarcador: String = '';

    constructor(
        private organizacionService: OrganizacionService,
        private auth: Auth,
        private geoReferenciaService: GeoReferenciaService,
        private location: Location,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private barriosService: BarrioService,
        private pacienteService: PacienteService,
        private parentescoService: ParentescoService,
        public appMobile: AppMobileService,
        private pacienteCache: PacienteCacheService,
        public plex: Plex) {
        this.nombrePattern = pacienteService.nombreRegEx.source;
    }

    ngOnInit() {
        this.updateTitle('Registrar un paciente');
        // obtiene el paciente cacheado
        this.pacienteCache.getPaciente().subscribe(res => {
            this.pacienteCache.getScanState().subscribe(result => {
                this.escaneado = result;
                if (res) {
                    this.paciente = JSON.parse(JSON.stringify(res));
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
                        this.plex.info('warning', 'Paciente inexistente', 'Error');
                    }
                }
            });
        });
        // consulta a la cache si el paciente fue escaneado o no

        this.relacionesBorradas = [];

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

        // Cargamos todas las provincias
        this.provinciaService.get({}).subscribe(rta => {
            this.provincias = rta;
        });

        this.provinciaService.get({
            nombre: 'Neuquén'
        }).subscribe(Prov => {
            this.provinciaNeuquen = Prov[0];
        });

        this.localidadService.get({
            nombre: 'Neuquén'
        }).subscribe(Loc => {
            this.localidadNeuquen = Loc[0];
        });

        this.showCargar = false;
        this.sexos = enumerados.getObjSexos();
        this.generos = enumerados.getObjGeneros();
        this.estadosCiviles = enumerados.getObjEstadoCivil();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.estados = enumerados.getEstados();

        // ubicacion inicial mapa de google
        if (!this.pacienteModel.direccion[0].geoReferencia) {
            this.organizacionService.getGeoreferencia(this.auth.organizacion.id).subscribe(point => {
                if (point) {
                    this.geoReferenciaAux = [point.lat, point.lng];
                    this.infoMarcador = this.auth.organizacion.nombre;
                }
            });
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
                    if (this.paciente.direccion[0].ubicacion.provincia !== null) {
                        (this.paciente.direccion[0].ubicacion.provincia.nombre === 'Neuquén') ? this.viveProvNeuquen = true : this.viveProvNeuquen = false;
                        this.loadLocalidades(this.paciente.direccion[0].ubicacion.provincia);
                    }
                    if (this.paciente.direccion[0].ubicacion.localidad !== null) {
                        (this.paciente.direccion[0].ubicacion.localidad.nombre === 'Neuquén') ? this.viveEnNeuquen = true : (this.viveEnNeuquen = false, this.barrios = null);
                        this.loadBarrios(this.paciente.direccion[0].ubicacion.localidad);
                    }
                    // ubicacion inicial mapa de google
                    if (this.paciente.direccion[0].geoReferencia) {
                        this.geoReferenciaAux = this.paciente.direccion[0].geoReferencia;
                        this.infoMarcador = this.paciente.direccion[0].valor;
                        if (this.paciente.direccion[0].ubicacion.barrio) {
                            this.infoMarcador += ', \n' + this.paciente.direccion[0].ubicacion.barrio.nombre;
                        }
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
        this.pacienteModel.genero = this.pacienteModel.genero ? this.pacienteModel.genero : this.pacienteModel.sexo;

        // Se piden los datos para app mobile en la 1er carga del paciente
        if (!this.paciente.id) {
            this.checkPass = true;
            this.activarApp = true;
        }
    }


    // ------------------ DATOS BASICOS -------------------------

    verificarDNISexo(listaSimilares) {
        let i = 0;
        let cond = false;
        let sexoPac = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
        while (i < listaSimilares.length && !cond) {
            if ((listaSimilares[i].paciente.documento === this.pacienteModel.documento) && (listaSimilares[i].paciente.sexo === sexoPac)) {
                this.enableIgnorarGuardar = false;
                cond = true;
            }
            i++;
        }
        return cond;
    }

    limpiarDocumento() {
        if (this.noPoseeDNI) {
            this.pacienteModel.documento = '';
            this.plex.info('warning', 'Recuerde que al guardar un paciente sin el número de documento será imposible realizar validaciones contra fuentes auténticas.');
        }
    }

    completarGenero() {
        if (!this.pacienteModel.genero) {
            this.pacienteModel.genero = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
        }
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
        if (provincia && provincia.id) {
            this.localidadService.getXProvincia(provincia.id).subscribe(result => {
                this.localidades = result;
            });
        }
    }

    loadBarrios(localidad) {
        if (localidad && localidad.id) {
            this.barriosService.getXLocalidad(localidad.id).subscribe(result => {
                this.barrios = result;
            });
        }
    }

    /**
     * Change del plex-bool viveProvNeuquen
     * carga las localidades correspondientes a Neuquén
     * @param {any} event
     */
    changeProvNeuquen(event) {
        if (event.value) {
            this.pacienteModel.direccion[0].ubicacion.provincia = this.provinciaNeuquen;
            this.loadLocalidades(this.provinciaNeuquen);
        } else {
            this.viveEnNeuquen = false;
            this.localidades = [];
        }
    }

    /**
     * Change del plex-bool viveNQN
     * carga los barrios de Neuquén
     * @param {any} event
     *
     * @memberOf PacienteCreateUpdateComponent
     */
    changeLocalidadNeuquen(event) {
        if (event.value) {
            this.pacienteModel.direccion[0].ubicacion.localidad = this.localidadNeuquen;
            this.loadBarrios(this.localidadNeuquen);
        } else {
            this.pacienteModel.direccion[0].ubicacion.localidad = null;
            this.barrios = [];
        }
    }

    actualizarMapa() {
        // campos de direccion completos?
        if (this.pacienteModel.direccion[0].valor && this.pacienteModel.direccion[0].ubicacion.provincia && this.pacienteModel.direccion[0].ubicacion.localidad) {
            // se calcula nueva georeferencia
            this.geoReferenciaService.post({ direccion: this.pacienteModel.direccion }).subscribe(point => {
                if (point) {
                    this.geoReferenciaAux = [point.lat, point.lng];
                    this.infoMarcador = this.pacienteModel.direccion[0].valor;
                    if (this.pacienteModel.direccion[0].ubicacion.barrio) {
                        this.infoMarcador += ', \n' + this.pacienteModel.direccion[0].ubicacion.barrio.nombre;
                    }
                } else {
                    this.plex.toast('warning', 'Dirección no encontrada. Intente con una similar.');
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

    save(event, ignoreCheck = false) {
        if (!event.formValid) {
            this.plex.info('warning', 'Debe completar los datos obligatorios');
            return;
        }
        this.pacienteCache.setScanState(false);
        this.disableGuardar = true;
        let pacienteGuardar: any = Object.assign({}, this.pacienteModel);
        pacienteGuardar.ignoreCheck = ignoreCheck;
        pacienteGuardar.sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
        pacienteGuardar.estadoCivil = this.pacienteModel.estadoCivil ? ((typeof this.pacienteModel.estadoCivil === 'string')) ? this.pacienteModel.estadoCivil : (Object(this.pacienteModel.estadoCivil).id) : null;
        pacienteGuardar.genero = this.pacienteModel.genero ? ((typeof this.pacienteModel.genero === 'string')) ? this.pacienteModel.genero : (Object(this.pacienteModel.genero).id) : undefined;
        pacienteGuardar.contacto.map(elem => {
            elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
            return elem;
        });
        pacienteGuardar.direccion[0].ubicacion.pais = this.paisArgentina;
        if (this.viveProvNeuquen) {
            pacienteGuardar.direccion[0].ubicacion.provincia = this.provinciaNeuquen;
        }
        if (this.viveEnNeuquen) {
            pacienteGuardar.direccion[0].ubicacion.localidad = this.localidadNeuquen;
        }
        if (this.geoReferenciaAux.length) {
            console.log('guarda georef: ', this.geoReferenciaAux);
            pacienteGuardar.direccion[0].geoReferencia = this.geoReferenciaAux;
        }

        this.pacienteService.save(pacienteGuardar).subscribe(
            resultadoSave => {
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
                    this.plex.info('success', 'Los datos se actualizaron correctamente');
                    this.location.back();
                }
            },
            error => {
                this.plex.info('warning', 'Error guardando el paciente');
            }
        );
        this.pacienteCache.setPaciente(null);
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
                    if (rel.referencia) {
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
        this.showMobile = false;
        this.location.back();
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
        this.geoReferenciaAux = coordenadas;
    }


    // ------------------- PARA VALIDACION ---------------------

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
        this.pacienteService.validar(this.pacienteModel).subscribe(resultado => {
            if (resultado.validado) {
                this.setBackup();
                this.validado = true;
                this.showDeshacer = true;
                this.pacienteModel.nombre = resultado.paciente.nombre;
                this.pacienteModel.apellido = resultado.paciente.apellido;
                this.pacienteModel.estado = resultado.paciente.estado;
                this.pacienteModel.fechaNacimiento = resultado.paciente.fechaNacimiento;
                this.pacienteModel.foto = resultado.paciente.foto;
                //  Se completan datos FALTANTES
                if (!this.pacienteModel.direccion[0].valor && resultado.paciente.direccion) {
                    this.pacienteModel.direccion[0].valor = resultado.paciente.direccion;
                }
                if (!this.pacienteModel.direccion[0].codigoPostal && resultado.paciente.cpostal) {
                    this.pacienteModel.direccion[0].codigoPostal = resultado.paciente.cpostal;
                }
                if (!this.pacienteModel.cuil && resultado.paciente.cuil) {
                    this.pacienteModel.cuil = resultado.paciente.cuil;
                }
                this.plex.info('success', '¡Paciente Validado!');
            } else {
                // ya existia paciente validado anteriormente
                if (resultado.paciente.id) {
                    this.pacienteModel = resultado.paciente;
                    if (!this.pacienteModel.contacto) {
                        this.pacienteModel.contacto = [this.contacto];
                    }
                    this.validado = true;
                    this.showDeshacer = true;
                    this.plex.info('info', 'El paciente que está intentando cargar ya se encontraba validado por otra fuente auténtica', 'Aviso');
                } else {
                    this.plex.toast('danger', 'Validación Fallida');
                    this.disableValidar = false;
                }
            }
            this.loading = false;
        });
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
