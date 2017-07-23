import { DocumentoEscaneado } from './documento-escaneado.const';
import { Server } from '@andes/shared';
import {
    IUbicacion
} from './../../interfaces/IUbicacion';
import {
    PacienteSearch
} from './../../services/pacienteSearch.interface';
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
    IBarrio
} from './../../interfaces/IBarrio';
import {
    ILocalidad
} from './../../interfaces/ILocalidad';
import {
    IPais
} from './../../interfaces/IPais';
import {
    IFinanciador
} from './../../interfaces/IFinanciador';
import {
    Observable
} from 'rxjs/Rx';
import {
    Component,
    OnInit,
    Output,
    Input,
    EventEmitter,
    HostBinding
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormArray,
    Validators
} from '@angular/forms';
import * as moment from 'moment';
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
    DomSanitizer,
    SafeHtml
} from '@angular/platform-browser';
import {
    Plex
} from '@andes/plex';
import {
    MapsComponent
} from './../../utils/mapsComponent';

@Component({
    selector: 'paciente-actualizar',
    templateUrl: 'paciente-actualizar.html'
})
export class pacienteActualizarComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    @Input('idPaciente') idPaciente: string;
    @Output() data: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

    estados = [];
    sexos: any[];
    generos: any[];
    estadosCiviles: any[];
    tipoComunicacion: any[];
    relacionTutores: any[];

    provincias: IProvincia[] = [];
    obrasSociales: IFinanciador[] = [];
    pacientesSimilares = [];
    barriosNeuquen: any[];
    localidadesNeuquen: any[];

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


    busquedaRel: any = {
        type: 'suggest',
        claveBlocking: 'documento',
        percentage: true,
        apellido: '',
        nombre: '',
        documento: '',
        sexo: '',
        fechaNacimiento: '',
        relacion: ''
    };

    showCargar: boolean;

    pacienteModel: IPaciente = {
        id: null,
        documento: '',
        cuil: '',
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
        foto: '',
        relaciones: null,
        financiador: null,
        identificadores: null,
        claveBlocking: null,
        entidadesValidadoras: [this.entidadValidadora],
        scan: null,
        reportarError: false,
        notaError: ''
    };


    constructor(private formBuilder: FormBuilder, private _sanitizer: DomSanitizer,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private barrioService: BarrioService,
        private pacienteService: PacienteService,
        private financiadorService: FinanciadorService, public plex: Plex, private server: Server) { }

    ngOnInit() {


        // Se cargan los combos
        this.financiadorService.get().subscribe(resultado => {
            this.obrasSociales = resultado;
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
        this.relacionTutores = enumerados.getObjRelacionTutor();

        if (this.idPaciente) {
            if (this.idPaciente) {
                // Busco el paciente en mongodb (caso que no este en mongo y si en elastic server)
                this.pacienteService.getById(this.idPaciente)
                    .subscribe(resultado => {
                        if (resultado) {
                            this.pacienteModel = Object.assign({}, resultado);
                            this.actualizarDatosPaciente();
                        }
                    });
            }
        }
    }

    actualizarDatosPaciente() {
        if (this.pacienteModel) {

            this.validado = (this.pacienteModel.estado === 'validado') ? true : false;
            if (this.pacienteModel.contacto) {
                if (this.pacienteModel.contacto.length <= 0) {
                    this.pacienteModel.contacto[0] = this.contacto;
                }
            } else {
                this.pacienteModel.contacto = [this.contacto];
            }

            if (this.pacienteModel.direccion) {
                if (this.pacienteModel.direccion.length <= 0) {
                    // Si la dirección existe pero esta vacía, completamos la 1er posición del arreglo con el schema default de dirección
                    this.pacienteModel.direccion[0] = this.direccion;
                } else {
                    if (this.pacienteModel.direccion[0].ubicacion) {
                        if (this.pacienteModel.direccion[0].ubicacion.provincia !== null) {
                            (this.pacienteModel.direccion[0].ubicacion.provincia.nombre === 'Neuquén') ? this.viveProvNeuquen = true : this.viveProvNeuquen = false;
                            this.loadLocalidades(this.pacienteModel.direccion[0].ubicacion.provincia);
                        }
                        if (this.pacienteModel.direccion[0].ubicacion.localidad !== null) {
                            (this.pacienteModel.direccion[0].ubicacion.localidad.nombre === 'Neuquén') ? this.viveEnNeuquen = true : this.viveEnNeuquen = false;
                            this.loadBarrios(this.pacienteModel.direccion[0].ubicacion.localidad);
                        }
                    }
                    if (!this.pacienteModel.reportarError) {
                        this.pacienteModel.reportarError = false;
                    }

                }
            } else {
                // Si no tenia dirección se le asigna el arreglo con el schema default
                this.pacienteModel.direccion = [this.direccion];
            }

            this.pacienteModel.genero = this.pacienteModel.genero ? this.pacienteModel.genero : this.pacienteModel.sexo;

        }
    }

    loadProvincias(event, pais) {
        if (pais && pais.id) {
            this.provinciaService.get({
                'pais': pais.id
            }).subscribe(event.callback);
        }
    }

    loadLocalidades(provincia) {
        if (provincia && provincia.id) {
            this.localidadService.get({
                'provincia': provincia.id
            }).subscribe(result => {
                this.localidadesNeuquen = [...result];
            });
        }
    }

    loadBarrios(localidad) {
        if (localidad && localidad.id) {
            this.barrioService.get({
                'localidad': localidad.id,
            }).subscribe(result => { this.barriosNeuquen = [...result]; });
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
            this.changeLocalidadNeuquen(false);
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
            this.plex.alert('Recuerde que al guardar un paciente sin el número de documento será imposible realizar validaciones contra fuentes auténticas.');
        }
    }

    limpiarContacto() {
        if (this.noPoseeContacto) {
            this.pacienteModel.contacto[0].valor = '';
        }
    }

    save(valid) {

        if (valid.formValid) {
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
                this.server.post('/core/log/mpi/macheoAlto', { data: { pacienteScan: this.pacienteModel } }, { params: null, showError: false }).subscribe(() => { });
            }

            if (this.posibleDuplicado) {
                this.server.post('/core/log/mpi/posibleDuplicado', { data: { pacienteScan: this.pacienteModel } }, { params: null, showError: false }).subscribe(() => { });
            }

            let operacionPac: Observable<IPaciente>;

            if (this.sugerenciaAceptada) {
                operacionPac = this.pacienteService.save(pacienteGuardar);
                operacionPac.subscribe(result => {

                    this.plex.alert('Los datos se actualizaron correctamente');
                    this.data.emit(result);
                });
            } else {
                operacionPac = this.pacienteService.save(pacienteGuardar);
                operacionPac.subscribe(result => {

                    if (result) {
                        this.plex.alert('Los datos se actualizaron correctamente');
                        this.data.emit(result);
                    } else {
                        this.plex.alert('ERROR: Ocurrio un problema al actualizar los datos');
                    }
                });
            }
        } else {
            this.plex.alert('Debe completar los datos obligatorios');
        }
    }

    onCancel() {
        this.data.emit(null);
    }


    onSelect(paciente: IPaciente) {
        this.pacienteModel = Object.assign({}, paciente);
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
            if (this.pacienteModel.nombre && this.pacienteModel.apellido && this.pacienteModel.documento
                && this.pacienteModel.fechaNacimiento && this.pacienteModel.sexo) {
                /*if (!this.pacienteModel.id) {*/
                let dto: any = {
                    type: 'suggest',
                    claveBlocking: 'documento',
                    percentage: true,
                    apellido: this.pacienteModel.apellido.toString(),
                    nombre: this.pacienteModel.nombre.toString(),
                    documento: this.pacienteModel.documento.toString(),
                    sexo: ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id),
                    fechaNacimiento: moment(this.pacienteModel.fechaNacimiento).format('YYYY-MM-DD')
                };

                this.pacienteService.get(dto).subscribe(resultado => {
                    this.pacientesSimilares = resultado;
                    if (this.pacientesSimilares.length > 0 && !this.sugerenciaAceptada) {
                        if (this.pacientesSimilares.length === 1 && this.pacientesSimilares[0].paciente.id === this.pacienteModel.id) {
                            resolve(false);

                        } else {


                            if (this.pacientesSimilares[0].match >= 0.9) {
                                if (this.pacientesSimilares[0].match >= 1.0) {
                                    this.onSelect(this.pacientesSimilares[0].paciente);
                                    this.pacientesSimilares = null;
                                    this.enableIgnorarGuardar = false;
                                } else {
                                    this.server.post('/core/log/mpi/macheoAlto', { data: { pacienteDB: this.pacientesSimilares[0], pacienteScan: this.pacienteModel } }, { params: null, showError: false }).subscribe(() => { });
                                    this.plex.alert('El paciente que está cargando ya existe en el sistema, favor seleccionar');
                                    this.enableIgnorarGuardar = false;
                                    this.disableGuardar = true;
                                }
                            } else {
                                if (!this.verificarDNISexo(this.pacientesSimilares)) {
                                    this.server.post('/core/log/mpi/posibleDuplicado', { data: { pacienteDB: this.pacientesSimilares[0], pacienteScan: this.pacienteModel } }, { params: null, showError: false }).subscribe(() => { });
                                    this.posibleDuplicado = true;
                                    this.plex.alert('Existen pacientes con un alto procentaje de matcheo, verifique la lista');
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
            if ((listaSimilares[i].paciente.documento == this.pacienteModel.documento) && (listaSimilares[i].paciente.sexo == sexoPac)) {
                this.enableIgnorarGuardar = false;
                cond = true;
            }
            i++;
        }
        return cond;
    }


    preSave(valid) {
        if (valid.formValid) {
            this.verificaPacienteRepetido().then((resultado) => {
                if (!resultado) {
                    this.save(valid);
                }
            });
        }
    }


    addContacto() {
        let nuevoContacto = Object.assign({}, this.contacto);
        this.pacienteModel.contacto.push(nuevoContacto);
    }

    removeContacto(i) {
        if (i >= 0) {
            this.pacienteModel.contacto.splice(i, 1);
        }
    }


    addFinanciador() {
        let nuevoFinanciador = {
            entidad: null,
            codigo: '',
            activo: true,
            fechaAlta: null,
            fechaBaja: null,
            ranking: this.pacienteModel.financiador ? this.pacienteModel.financiador.length : 0
        };

        if (this.pacienteModel.financiador) {
            this.pacienteModel.financiador.push(nuevoFinanciador);
        } else {
            this.pacienteModel.financiador = [nuevoFinanciador];
        }


    }

    removeFinanciador(i) {
        if (i >= 0) {
            this.pacienteModel.financiador.splice(i, 1);
        }
    }



    addRelaciones() {
        alert('Reimplementar la interfase con el tipo de datos "string" en minúscula');
        // let unaRelacion = {
        //     relacion: '',
        //     referencia: null,
        //     nombre: '',
        //     apellido: '',
        //     documento: ''
        // };

        // if (this.pacienteModel.relaciones) {
        //     this.pacienteModel.relaciones.push(unaRelacion);
        // } else {
        //     this.pacienteModel.relaciones = [unaRelacion];
        // }
    }


}
