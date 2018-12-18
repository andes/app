import {
    AppMobileService
} from './../../../services/appMobile.service';
import {
    ParentescoService
} from './../../../services/parentesco.service';

import {
    IUbicacion
} from './../../../interfaces/IUbicacion';
import {
    PacienteSearch
} from './../../../interfaces/pacienteSearch.interface';
import {
    IContacto
} from './../../../interfaces/IContacto';
import {
    FinanciadorService
} from './../../../services/financiador.service';
import {
    IDireccion
} from '../../../core/mpi/interfaces/IDireccion';
import {
    IBarrio
} from './../../../interfaces/IBarrio';
import {
    ILocalidad
} from './../../../interfaces/ILocalidad';
import {
    IPais
} from './../../../interfaces/IPais';
import {
    IFinanciador
} from './../../../interfaces/IFinanciador';
import {
    Observable
} from 'rxjs/Rx';
import {
    LogService
} from './../../../services/log.service';
import {
    BarrioService
} from './../../../services/barrio.service';
import {
    LocalidadService
} from './../../../services/localidad.service';
import {
    ProvinciaService
} from './../../../services/provincia.service';
import {
    PaisService
} from './../../../services/pais.service';
import {
    AnsesService,
} from './../../../services/fuentesAutenticas/servicioAnses.service';
import {
    PacienteService
} from '../../../core/mpi/services/paciente.service';
import * as enumerados from './../../../utils/enumerados';
import {
    IPaciente
} from '../../../core/mpi/interfaces/IPaciente';
import {
    IProvincia
} from './../../../interfaces/IProvincia';
import {
    FechaPipe
} from './../../../pipes/fecha.pipe';
import {
    Plex
} from '@andes/plex';
import {
    MapsComponent
} from './../../../utils/mapsComponent';
import * as moment from 'moment';
import {
    PacientePipe
} from './../../../pipes/paciente.pipe';
import {
    EdadPipe
} from './../../../pipes/edad.pipe';

import {
    FormBuilder,
    FormGroup,
    FormArray,
    Validators
} from '@angular/forms';
import {
    DomSanitizer,
    SafeHtml,
} from '@angular/platform-browser';
import {
    Component,
    OnInit,
    Output,
    Input,
    EventEmitter,
    HostBinding
} from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';


@Component({
    selector: 'paciente-cru',
    templateUrl: 'paciente-cru.html'
})
export class PacienteCruComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    // @Input() paciente: IPaciente;
    // @Input() isScan: IPaciente;
    // @Input() escaneado: Boolean;
    @Output() data: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

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
    barriosNeuquen: any[];
    localidadesNeuquen: any[] = [];

    paisArgentina = null;
    provinciaNeuquen = null;
    localidadNeuquen = null;
    validado = false;
    noPoseeDNI = false;
    noPoseeContacto = false;
    contactosBackUp = [];
    disableGuardar = false;
    enableIgnorarGuardar = false;
    sugerenciaAceptada = false;
    entidadValidadora = '';
    viveEnNeuquen = false;
    viveProvNeuquen = false;
    posibleDuplicado = false;
    altoMacheo = false;
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

    public paciente: IPaciente;
    public nombrePattern: string;

    // PARA LA APP MOBILE
    public showMobile = false;
    public checkPass = false;
    public emailAndes: String = '';
    public messageApp: String = '';
    public celularAndes: String = '';
    public activarApp = false;

    public escaneado = false;

    constructor(private formBuilder: FormBuilder, private _sanitizer: DomSanitizer,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private logService: LogService,
        private barrioService: BarrioService,
        private pacienteService: PacienteService,
        private parentescoService: ParentescoService,
        private ansesService: AnsesService,
        public appMobile: AppMobileService,
        public route: ActivatedRoute,
        private financiadorService: FinanciadorService, public plex: Plex) {
        this.nombrePattern = pacienteService.nombreRegEx.source;
    }

    ngOnInit() {
        this.updateTitle('Registrar un paciente');
        this.route.queryParams.subscribe((params: any) => {
            this.paciente = JSON.parse(params[0]);
        });

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
        /*this.relacionTutores = enumerados.getObjRelacionTutor();*/
        if (this.paciente && !this.isEmptyObject(this.paciente)) {
            this.actualizarDatosPaciente();
            if (this.paciente.id) {
                // Busco el paciente en mongodb (caso que no este en mongo y si en elastic server)
                this.pacienteService.getById(this.paciente.id)
                    .subscribe(resultado => {
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
        if (this.paciente.id) {
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
                this.localidadesNeuquen = result;
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
            this.localidadesNeuquen = [];
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

    verificarCorreoValido(indice, form) {
        let formato = new RegExp(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/);
        let mail = String(this.pacienteModel.contacto[indice].valor);
        form.form.controls['valor-' + indice].setErrors(null);  // con cada caracter nuevo 'limpia' el error y reevalúa
        window.setTimeout(() => {
            if (mail) {
                if (formato.test(mail)) {
                    form.form.controls['valor-' + indice].setErrors(null);
                } else {
                    form.form.controls['valor-' + indice].setErrors({ 'invalid': true });
                }
            }
        }, 500);
    }

    chequearContacto(key) {
        let index = this.pacienteModel.contacto.findIndex(item => item.tipo === key);
        if (index >= 0) {
            return true;
        } else {
            return false;
        }
    }

    verificarContactosRepetidos() {
        let valores = [];
        for (let elem of this.pacienteModel.contacto) {
            const item = valores.find(s => s === elem.valor);
            if (item) {
                return false;
            } else {
                valores.push(elem.valor);
            }
        }
        return true;
    }

    limpiarContacto() {
        if (this.noPoseeContacto) { // checkbox en true
            this.contactosBackUp = this.pacienteModel.contacto;
            this.pacienteModel.contacto = [this.contacto];
        } else {
            this.pacienteModel.contacto = this.contactosBackUp;
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



    // ------------------ SAVE -----------------------------

    preSave(valid) {
        if (valid.formValid) {
            if (this.pacienteModel.documento) {
                this.verificaPacienteRepetido().then((resultado) => {
                    if (!resultado) {
                        this.save(valid);
                        this.disableGuardar = true;
                    }
                });
            } else {
                this.save(valid);
                this.disableGuardar = true;
            }
        } else {
            this.plex.info('warning', 'Debe completar los datos obligatorios');
        }
    }

    save(valid) {
        const repetidos = this.verificarContactosRepetidos();
        if (valid.formValid && repetidos) {

            let pacienteGuardar = Object.assign({}, this.pacienteModel);

            pacienteGuardar.sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
            pacienteGuardar.estadoCivil = this.pacienteModel.estadoCivil ? ((typeof this.pacienteModel.estadoCivil === 'string')) ? this.pacienteModel.estadoCivil : (Object(this.pacienteModel.estadoCivil).id) : null;
            pacienteGuardar.genero = this.pacienteModel.genero ? ((typeof this.pacienteModel.genero === 'string')) ? this.pacienteModel.genero : (Object(this.pacienteModel.genero).id) : undefined;

            pacienteGuardar.contacto.map(elem => {
                elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
                return elem;
            });

            // Luego aquí habría que validar pacientes de otras prov. y paises (Por ahora solo NQN)
            pacienteGuardar.direccion[0].ubicacion.pais = this.paisArgentina;

            if (this.viveProvNeuquen) {
                pacienteGuardar.direccion[0].ubicacion.provincia = this.provinciaNeuquen;
            }
            if (this.viveEnNeuquen) {
                pacienteGuardar.direccion[0].ubicacion.localidad = this.localidadNeuquen;
            }
            if (this.altoMacheo) {
                this.logService.post('mpi', 'macheoAlto', {
                    paciente: this.pacienteModel
                }).subscribe(() => { });
            }
            if (this.posibleDuplicado) {
                this.logService.post('mpi', 'posibleDuplicado', {
                    paciente: this.pacienteModel
                }).subscribe(() => { });
            }
            // Chequeamos cambios en relaciones del paciente
            if (pacienteGuardar.documento) {
                this.actualizarRelaciones(pacienteGuardar);
            }

            // NAVEGAR HACIA ATRAS LUEGO DE GUARDAR

        } else {
            this.plex.info('Debe completar los datos obligatorios. Verificar los contactos', 'Información');
        }
    }

    // Borra/agrega relaciones al paciente segun corresponda.
    actualizarRelaciones(unPaciente) {
        this.pacienteService.save(unPaciente).subscribe(unPacienteSave => {
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
                this.data.emit(unPacienteSave);
                this.plex.info('success', 'Los datos se actualizaron correctamente');
            } else {
                this.plex.info('warning', 'ERROR: Ocurrió un problema al actualizar los datos');
            }
        });
    }

    // Verifica paciente repetido y genera lista de candidatos
    verificaPacienteRepetido() {
        this.posibleDuplicado = false;
        this.altoMacheo = false;

        return new Promise((resolve, reject) => {
            if (this.pacienteModel.nombre && this.pacienteModel.apellido && this.pacienteModel.documento &&
                this.pacienteModel.fechaNacimiento && this.pacienteModel.sexo) {
                let dto: any = {
                    type: 'suggest',
                    claveBlocking: 'documento',
                    percentage: true,
                    apellido: this.pacienteModel.apellido.toString(),
                    nombre: this.pacienteModel.nombre.toString(),
                    documento: this.pacienteModel.documento.toString(),
                    sexo: ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id),
                    fechaNacimiento: this.pacienteModel.fechaNacimiento
                };
                this.pacienteService.get(dto).subscribe(resultado => {
                    this.pacientesSimilares = resultado;

                    // agregamos la condición de abajo para filtrar las sugerencias
                    // cuando el paciente fue escaneado o ya estaba validado.
                    if (this.escaneado || this.pacienteModel.estado === 'validado') {

                        this.pacientesSimilares = this.pacientesSimilares.filter(item => item.paciente.estado === 'validado');
                    }
                    this.pacientesSimilares = this.pacientesSimilares.filter(item => item.match >= 0.88);
                    if (this.pacientesSimilares.length > 0 && !this.sugerenciaAceptada) {
                        // Nos quedamos todos los pacientes menos el mismo.

                        this.pacientesSimilares = this.pacientesSimilares.filter(paciente => paciente.paciente.id !== this.pacienteModel.id);
                        if (this.pacientesSimilares.length <= 0) {
                            resolve(false);
                        } else {
                            if (this.pacientesSimilares[0].match >= 0.94) {
                                if (this.pacientesSimilares[0].match >= 1.0) {
                                    this.onSelect(this.pacientesSimilares[0].paciente);
                                    this.pacientesSimilares = null;
                                    this.enableIgnorarGuardar = false;
                                } else {
                                    this.logService.post('mpi', 'macheoAlto', {
                                        pacienteDB: this.pacientesSimilares[0],
                                        pacienteScan: this.pacienteModel
                                    }).subscribe(() => { });
                                    this.plex.info('warning', 'El paciente que está cargando ya existe, debe buscarlo y seleccionarlo');
                                    this.enableIgnorarGuardar = false;
                                    this.disableGuardar = true;
                                }
                            } else {
                                if (!this.verificarDNISexo(this.pacientesSimilares)) {
                                    this.logService.post('mpi', 'posibleDuplicado', {
                                        pacienteDB: this.pacientesSimilares[0],
                                        pacienteScan: this.pacienteModel
                                    }).subscribe(() => { });
                                    this.posibleDuplicado = true;
                                    this.plex.info('warning', 'Existen pacientes con un alto porcentaje de coincidencia, verifique la lista');
                                    this.enableIgnorarGuardar = true;
                                    this.disableGuardar = true;
                                } else {
                                    resolve(true);
                                }
                            }
                            resolve(true);
                        }
                    } else {
                        this.disableGuardar = false;
                        this.enableIgnorarGuardar = false;
                        resolve(false);
                    }
                });
            } else {
                resolve(false);
            }
        });
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
        // VER NAVEGAR HACIA ATRAS
        this.showMobile = false;
        this.data.emit(null);
    }

    // ---------------- NOTIFICACIONES --------------------

    renaperNotification(event) {
        this.validado = event;
    }

    notasNotification(notasNew) {
        this.pacienteModel.notas = notasNew;
    }


    // addFinanciador() {
    //     let nuevoFinanciador = {
    //         entidad: null,
    //         codigo: '',
    //         activo: true,
    //         fechaAlta: null,
    //         fechaBaja: null,
    //         ranking: this.pacienteModel.financiador ? this.pacienteModel.financiador.length : 0
    //     };
    //     if (this.pacienteModel.financiador) {
    //         this.pacienteModel.financiador.push(nuevoFinanciador);
    //     } else {
    //         this.pacienteModel.financiador = [nuevoFinanciador];
    //     }
    // }

    // removeFinanciador(i) {
    //     if (i >= 0) {
    //         this.pacienteModel.financiador.splice(i, 1);
    //     }
    // }
}
