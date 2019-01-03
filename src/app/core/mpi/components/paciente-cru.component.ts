import { AppMobileService } from './../../../services/appMobile.service';
import { ParentescoService } from './../../../services/parentesco.service';
import { IContacto } from './../../../interfaces/IContacto';
import { IDireccion } from '../../../core/mpi/interfaces/IDireccion';
import { LogService } from './../../../services/log.service';
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
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteCacheService } from '../services/pacienteCache.service';
import { BarrioService } from '../../../services/barrio.service';

@Component({
    selector: 'paciente-cru',
    templateUrl: 'paciente-cru.html'
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

    public escaneado = false;
    public paciente: IPaciente;
    public nombrePattern: string;
    // PARA LA APP MOBILE
    public showMobile = false;
    public checkPass = false;
    public emailAndes: String = '';
    public messageApp: String = '';
    public celularAndes: String = '';
    public activarApp = false;

    constructor(
        public router: Router,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private barriosService: BarrioService,
        private logService: LogService,
        private pacienteService: PacienteService,
        private parentescoService: ParentescoService,
        public appMobile: AppMobileService,
        public route: ActivatedRoute,
        private pacienteCache: PacienteCacheService,
        public plex: Plex) {
        this.nombrePattern = pacienteService.nombreRegEx.source;
    }

    ngOnInit() {
        this.updateTitle('Registrar un paciente');
        this.pacienteCache.getPaciente().subscribe(res => {
            if (res && !this.isEmptyObject(res)) {
                this.paciente = JSON.parse(JSON.stringify(res));
                this.actualizarDatosPaciente();
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
                }
            }
        });
        this.pacienteCache.getScanState().subscribe(result => { this.escaneado = result; });

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

        // Se cargan los enumerados
        this.showCargar = false;
        this.sexos = enumerados.getObjSexos();
        this.generos = enumerados.getObjGeneros();
        this.estadosCiviles = enumerados.getObjEstadoCivil();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.estados = enumerados.getEstados();

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

    isEmptyObject(obj) {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return JSON.stringify(obj) === JSON.stringify({});
    }


    // ---------------- PACIENTE -----------------------

    onSelect(paciente: IPaciente) {
        this.paciente = Object.assign({}, paciente);
        this.actualizarDatosPaciente();
        this.disableGuardar = false;
        this.enableIgnorarGuardar = false;
        this.sugerenciaAceptada = true;
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
                        (this.paciente.direccion[0].ubicacion.localidad.nombre === 'Neuquén') ? this.viveEnNeuquen = true : this.viveEnNeuquen = false;
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
        this.pacienteModel.genero = this.pacienteModel.genero ? this.pacienteModel.genero : this.pacienteModel.sexo;

        // Se verifican los datos de la app mobile
        if (!this.paciente.id) {
            // this.appMobile.check(this.paciente.id).subscribe(data => {
            //     if (!data.account) {
            //         // No posee cuenta
            //         this.checkPass = true;
            //         this.activarApp = true;
            //     }
            // });
        } else {
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
            this.loadBarrios(this.localidadNeuquen);
        } else {
            this.pacienteModel.direccion[0].ubicacion.localidad = null;
            this.barrios = [];
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
        // Chequeamos cambios en relaciones del paciente
        if (pacienteGuardar.documento) {
            this.actualizarRelaciones(pacienteGuardar);
        }
        this.pacienteService.save(pacienteGuardar).subscribe(
            resultadoSave => {
                // Existen sugerencias de pacientes similares?
                if (resultadoSave.resultadoMatching && resultadoSave.resultadoMatching.length > 0 && !this.sugerenciaAceptada) {
                    if (this.escaneado) {
                        this.pacientesSimilares = resultadoSave.resultadoMatching.filter(elem => elem.paciente.estado === 'validado');
                    }
                    // Si el matcheo es alto o el dni-sexo está repetido no podemos ignorar las sugerencias
                    this.enableIgnorarGuardar = !resultadoSave.macheoAlto && !resultadoSave.dniRepetido;
                    if (this.pacientesSimilares && this.pacientesSimilares.length > 0 && this.pacientesSimilares[0].match >= 1.0) {  // Hay un matcheo del 100%?
                        this.plex.info('danger', 'El paciente ya existe, verifique los datos', 'Atención');
                        this.onSelect(this.pacientesSimilares[0].paciente);
                        this.pacientesSimilares = null;
                    } else {
                        if (!this.enableIgnorarGuardar) {
                            this.plex.info('danger', 'El paciente que ya existe, verifique las sugerencias');
                        } else {
                            this.plex.info('warning', 'Existen pacientes similares, verifique las sugerencias');
                        }
                    }
                } else {
                    this.actualizarRelaciones(resultadoSave);
                    this.plex.info('success', 'Los datos se actualizaron correctamente');
                    this.router.navigate(['apps/mpi/busqueda']);
                }
            },
            error => {
                this.plex.info('warning', 'Error guardando el paciente');
            }
        );
    }

    // Borra/agrega relaciones al paciente segun corresponda.
    actualizarRelaciones(unPacienteSave) {
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
                        documento: unPacienteSave.documento ? unPacienteSave.documento : '',
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

    // Verifica paciente repetido y genera lista de candidatos


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
        this.router.navigate(['apps/mpi/busqueda']);

    }

    // ---------------- NOTIFICACIONES --------------------

    renaperNotification(event) {
        this.validado = event;
    }

    notasNotification(notasNew) {
        this.pacienteModel.notas = notasNew;
    }

}
