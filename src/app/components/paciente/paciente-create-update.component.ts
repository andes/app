import {
    AppMobileService
} from './../../services/appMobile.service';
import {
    ParentescoService
} from './../../services/parentesco.service';

import {
    IContacto
} from './../../interfaces/IContacto';
import {
    FinanciadorService
} from './../../services/financiador.service';
import {
    IDireccion
} from './../../interfaces/IDireccion';

import {
    IFinanciador
} from './../../interfaces/IFinanciador';
import {
    LogService
} from './../../services/log.service';
import {
    BarrioService
} from './../../services/barrio.service';
import {
    LocalidadService
} from './../../services/localidad.service';
import {
    ProvinciaService
} from './../../services/provincia.service';
import {
    PaisService
} from './../../services/pais.service';
import {
    AnsesService,
} from './../../services/fuentesAutenticas/servicioAnses.service';
import {
    PacienteService
} from './../../services/paciente.service';
import * as enumerados from './../../utils/enumerados';
import {
    IPaciente
} from './../../interfaces/IPaciente';
import {
    IProvincia
} from './../../interfaces/IProvincia';
import {
    Plex
} from '@andes/plex';
import * as moment from 'moment';
import {
    FormBuilder
} from '@angular/forms';
import {
    DomSanitizer
} from '@angular/platform-browser';
import {
    Component,
    OnInit,
    Output,
    Input,
    EventEmitter,
    HostBinding
} from '@angular/core';

@Component({
    selector: 'paciente-create-update',
    templateUrl: 'paciente-create-update.html',
    styleUrls: ['paciente-create-update.scss']
})
export class PacienteCreateUpdateComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    @Input() seleccion: IPaciente;
    @Input() isScan: IPaciente;
    @Input() escaneado: Boolean;
    @Output() data: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    foto = '';
    estados = [];
    sexos: any[];
    generos: any[];
    estadosCiviles: any[];
    tipoComunicacion: any[];
    parentescoModel: any[];
    relacionesBorradas: any[];
    relacionesIniciales: any[] = [];
    posiblesRelaciones: any[] = [];

    provincias: IProvincia[] = [];
    // obrasSociales: IFinanciador[] = [];
    pacientesSimilares = [];
    barriosNeuquen: any[];
    localidadesNeuquen: any[] = [];

    paisArgentina = null;
    provinciaNeuquen = null;
    localidadNeuquen = null;
    unSexo = null;
    unEstadoCivil = null;
    unGenero = null;

    error = false;
    mensaje = '';
    validado = false;
    noPoseeDNI = false;
    noPoseeContacto = false;
    disableGuardar = false;
    enableIgnorarGuardar = false;
    sugerenciaAceptada = false;
    entidadValidadora = '';
    viveEnNeuquen = false;
    viveProvNeuquen = false;
    posibleDuplicado = false;
    altoMacheo = false;
    buscarPacRel = '';
    timeoutHandle: number;
    PacientesRel = null;
    loading = false;
    esEscaneado = false;
    nuevaNota = '';
    autoFocus = 0;
    hoy = moment().endOf('day').toDate();
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

    showCargar: boolean;

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

    public nombrePattern: string;

    // PARA LA APP MOBILE
    public showMobile = false;
    public checkPass = false;
    public emailAndes: String = '';
    public messageApp: String = '';
    public celularAndes: String = '';
    public activarApp = false;

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
        private financiadorService: FinanciadorService, public plex: Plex) {
        this.nombrePattern = pacienteService.nombreRegEx.source;
    }

    ngOnInit() {
        // Se cargan los combos
        // this.financiadorService.get().subscribe(resultado => {
        //     this.obrasSociales = resultado;
        // });

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
        if (this.seleccion && !this.isEmptyObject(this.seleccion)) {
            this.actualizarDatosPaciente();
            if (this.seleccion.id) {
                // Busco el paciente en mongodb (caso que no este en mongo y si en elastic server)
                this.pacienteService.getById(this.seleccion.id)
                    .subscribe(resultado => {
                        if (resultado) {
                            if (!resultado.scan) {
                                resultado.scan = this.seleccion.scan;
                            }

                            if (this.escaneado && resultado.estado !== 'validado') {
                                resultado.nombre = this.seleccion.nombre.toUpperCase();
                                resultado.apellido = this.seleccion.apellido.toUpperCase();
                                resultado.fechaNacimiento = this.seleccion.fechaNacimiento;
                                resultado.sexo = this.seleccion.sexo;
                                resultado.documento = this.seleccion.documento;
                            }
                            this.seleccion = Object.assign({}, resultado);
                        }
                        this.actualizarDatosPaciente();

                        // Se guarda estado de las relaciones al comenzar la edición
                        if (this.pacienteModel.relaciones && this.pacienteModel.relaciones.length) {
                            this.relacionesIniciales = this.pacienteModel.relaciones.slice(0, this.pacienteModel.relaciones.length);
                        }
                    });
            }
            if (this.seleccion.notas && this.seleccion.notas.length) {
                this.mostrarNotas();
            }
        }
    }

    isEmptyObject(obj) {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return JSON.stringify(obj) === JSON.stringify({});
    }

    actualizarDatosPaciente() {
        if (this.escaneado) {
            this.validado = true;
            this.seleccion.estado = 'validado';
            if (this.seleccion.entidadesValidadoras) {
                if (this.seleccion.entidadesValidadoras.length <= 0) {
                    // Caso que el paciente existe y no tiene ninguna entidad validadora e ingresó como validado
                    this.seleccion.entidadesValidadoras.push('RENAPER');
                } else {
                    let validador = this.seleccion.entidadesValidadoras.find(entidad => entidad === 'RENAPER');
                    if (!validador) {
                        this.seleccion.entidadesValidadoras.push('RENAPER');
                    }
                }
            } else {
                // El caso que el paciente no existe
                this.seleccion.entidadesValidadoras = ['RENAPER'];
            }

        } else {
            if (this.seleccion.estado !== 'validado') {
                this.validado = false;
                this.seleccion.estado = 'temporal';
            } else {
                this.validado = true;
            }
        }

        if (this.seleccion.contacto) {
            if (this.seleccion.contacto.length <= 0) {
                this.seleccion.contacto[0] = this.contacto;
            }
        } else {
            this.seleccion.contacto = [this.contacto];

        }

        if (this.seleccion.direccion) {
            if (this.seleccion.direccion.length <= 0) {
                // Si la dirección existe pero esta vacía, completamos la 1er posición del arreglo con el schema default de dirección
                this.seleccion.direccion[0] = this.direccion;
            } else {
                if (this.seleccion.direccion[0].ubicacion) {
                    if (this.seleccion.direccion[0].ubicacion.provincia !== null) {
                        (this.seleccion.direccion[0].ubicacion.provincia.nombre === 'Neuquén') ? this.viveProvNeuquen = true : this.viveProvNeuquen = false;
                        this.loadLocalidades(this.seleccion.direccion[0].ubicacion.provincia);
                    }
                    if (this.seleccion.direccion[0].ubicacion.localidad !== null) {
                        (this.seleccion.direccion[0].ubicacion.localidad.nombre === 'Neuquén') ? this.viveEnNeuquen = true : this.viveEnNeuquen = false;
                        this.loadBarrios(this.seleccion.direccion[0].ubicacion.localidad);
                    }
                }
                if (!this.seleccion.reportarError) {
                    this.seleccion.reportarError = false;
                }

            }
        } else {
            // Si no tenia dirección se le asigna el arreglo con el schema default
            this.seleccion.direccion = [this.direccion];
        }

        this.pacienteModel = Object.assign({}, this.seleccion);
        this.pacienteModel.genero = this.pacienteModel.genero ? this.pacienteModel.genero : this.pacienteModel.sexo;

        // Se verifican los datos de la app mobile
        if (this.seleccion.id) {
            // this.appMobile.check(this.seleccion.id).subscribe(data => {
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

    mostrarNotas() {
        let texto: any;
        this.seleccion.notas.forEach(nota => {
            texto = nota.nota;
            if (nota.destacada) {
                this.plex.toast('info', texto);
            }
        });
    }

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

    loadBarrios(localidad) {
        if (localidad && localidad.id) {
            this.barrioService.get({
                'localidad': localidad.id,
            }).subscribe(result => {
                this.barriosNeuquen = [...result];
            });
        }
    }
    /**
     * Change del plex-bool viveProvNeuquen
     * carga las localidades correspondientes a Neuquén
     * @param {any} event
     *
     * @memberOf PacienteCreateUpdateComponent
     */
    changeProvNeuquen(event) {
        if (event.value) {
            this.loadLocalidades(this.provinciaNeuquen);
        } else {
            this.viveEnNeuquen = false;
            this.localidadesNeuquen = [];
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
            this.barriosNeuquen = [];
        }
    }

    completarGenero() {
        if (!this.pacienteModel.genero) {
            this.pacienteModel.genero = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
        }
    }

    limpiarDocumento() {
        if (this.noPoseeDNI) {
            this.pacienteModel.documento = '';
            this.plex.info('info', 'Recuerde que al guardar un paciente sin el número de documento será imposible realizar validaciones contra fuentes auténticas.', 'Aviso');
        }
    }
    limpiarContacto() {
        if (this.noPoseeContacto) {
            this.pacienteModel.contacto = [this.contacto];
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
            this.actualizarRelaciones(pacienteGuardar);
        } else {
            this.plex.info('info', 'Debe completar los datos obligatorios. Verificar los contactos', 'Aviso');
        }
    }

    // Resultado de la búsqueda de pacientes para relacionar (Tab 'relaciones')
    actualizarPosiblesRelaciones(listaPacientes: any[]) {
        // Se elimina el paciente en edición
        listaPacientes = listaPacientes.filter(p => p.id !== this.pacienteModel.id);

        // Se eliminan de los resultados de la búsqueda los pacientes ya relacionados
        if (this.pacienteModel.relaciones && this.pacienteModel.relaciones.length) {
            for (let i = 0; i < this.pacienteModel.relaciones.length; i++) {
                listaPacientes = listaPacientes.filter(p => p.id !== this.pacienteModel.relaciones[i].referencia);
            }
        }
        this.posiblesRelaciones = listaPacientes;
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
                this.data.emit(unPacienteSave);
                this.plex.info('success', 'Los datos se actualizaron correctamente');
            } else {
                this.plex.info('warning', 'ERROR: Ocurrió un problema al actualizar los datos');
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
                        this.plex.info('info', 'El paciente no tiene asignado un email.', 'Atención');
                    }
                    if (datos.error === 'email_exists') {
                        this.plex.info('info', 'El mail ingresado ya existe, ingrese otro email', 'Atención');
                    }
                } else {
                    this.plex.info('success', 'Se ha enviado el código de activación al paciente');
                }
            });
        }
    }

    onCancel() {
        this.showMobile = false;
        this.data.emit(null);
    }
    onSelect(paciente: IPaciente) {
        this.seleccion = Object.assign({}, paciente);
        this.actualizarDatosPaciente();
        this.disableGuardar = false;
        this.enableIgnorarGuardar = false;
        this.sugerenciaAceptada = true;
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
                                    this.plex.info('info', 'El paciente que está cargando ya existe en el sistema, favor seleccionar', 'Atención');
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
                                    this.plex.info('info', 'Existen pacientes con un alto procentaje de matcheo, verifique la lista', 'Atención');
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
            this.plex.info('info', 'Debe completar los datos obligatorios', 'Aviso');
        }
    }

    addContacto(key, valor) {
        let nuevoContacto = Object.assign({}, {
            tipo: key,
            valor: valor,
            ranking: 0,
            activo: true,
            ultimaActualizacion: new Date()
        });
        this.pacienteModel.contacto.push(nuevoContacto);
    }

    removeContacto(i) {
        if (i >= 0) {
            this.pacienteModel.contacto.splice(i, 1);
        }
    }

    seleccionarPacienteRelacionado(pacienteEncontrado) {
        if (pacienteEncontrado) {
            let ultimaRelacion = null;
            let permitirNuevaRelacion = true;
            // Control: Si los datos de las relaciones agregadas anteriormente no estan completas, no se permitira agregar nuevas.
            if (this.pacienteModel.relaciones && this.pacienteModel.relaciones.length) {
                ultimaRelacion = this.pacienteModel.relaciones[this.pacienteModel.relaciones.length - 1];
                permitirNuevaRelacion = ultimaRelacion.relacion;
            }

            if (permitirNuevaRelacion) {
                this.buscarPacRel = '';
                let unaRelacion = Object.assign({}, {
                    relacion: null,
                    referencia: null,
                    nombre: '',
                    apellido: '',
                    documento: '',
                    foto: ''
                });

                // Se completan los campos de la nueva relación
                unaRelacion.referencia = pacienteEncontrado.id;
                unaRelacion.documento = pacienteEncontrado.documento;
                unaRelacion.apellido = pacienteEncontrado.apellido;
                unaRelacion.nombre = pacienteEncontrado.nombre;
                if (pacienteEncontrado.foto) {
                    unaRelacion.foto = pacienteEncontrado.foto;
                }

                // Se inserta nueva relación en array de relaciones del paciente
                let index = null;
                if (this.pacienteModel.relaciones) {
                    this.pacienteModel.relaciones.push(unaRelacion);
                } else {
                    this.pacienteModel.relaciones = [unaRelacion];
                }

                // Si esta relación fue borrada anteriormente en esta edición, se quita del arreglo 'relacionesBorradas'
                index = this.relacionesBorradas.findIndex(rel => rel.documento === unaRelacion.documento);
                if (index >= 0) {
                    this.relacionesBorradas.splice(index, 1);
                }
                // Se borran los resultados de la búsqueda.
                this.posiblesRelaciones = null;
            } else {
                this.plex.toast('info', 'Antes de agregar una nueva relación debe completar las existentes.', 'Aviso');
            }
        }
    }

    removeRelacion(i) {
        if (i >= 0) {
            // si la relacion borrada ya se encotraba almacenada en la DB
            let index = this.relacionesIniciales.findIndex(unaRel => unaRel.documento === this.pacienteModel.relaciones[i].documento);
            if (index >= 0) {
                this.relacionesBorradas.push(this.pacienteModel.relaciones[i]);
            }
            this.pacienteModel.relaciones.splice(i, 1);
        }
    }

    removeNota(i) {
        if (i >= 0) {
            this.pacienteModel.notas.splice(i, 1);
        }
    }

    addNota() {
        let nuevaNota = {
            'fecha': new Date(),
            'nota': '',
            'destacada': false
        };
        if (this.nuevaNota) {
            nuevaNota.nota = this.nuevaNota;
            if (this.pacienteModel.notas) {
                this.pacienteModel.notas.push(nuevaNota);
            } else {
                this.pacienteModel.notas = [nuevaNota];
            }
            if (this.pacienteModel.notas.length > 1) {
                this.pacienteModel.notas.sort((a, b) => {
                    return (a.fecha.getDate() > b.fecha.getDate() ? 1 : (b.fecha.getDate() > a.fecha.getDate() ? -1 : 0));
                });
            }
        }
        this.nuevaNota = '';
    }

    destacarNota(indice: any) {
        this.pacienteModel.notas[indice].destacada = !this.pacienteModel.notas[indice].destacada;
        if (this.pacienteModel.notas.length > 1) {
            this.pacienteModel.notas.sort((a, b) => {
                let resultado = (a.destacada && !b.destacada ? -1 : (b.destacada && !a.destacada ? 1 : 0));
                return resultado;
            });
        }
    }

    chequearContacto(key) {
        let index = this.pacienteModel.contacto.findIndex(item => item.tipo === key);
        if (index >= 0) {
            return true;
        } else {
            return false;
        }
    }

    gestionMobile(band) {
        this.showMobile = band;
    }

    renaperNotification(event) {
        this.validado = event;
    }
}
