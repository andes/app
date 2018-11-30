import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { Plex } from '@andes/plex';
import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { PaisService } from '../../../services/pais.service';
import { LocalidadService } from '../../../services/localidad.service';
import { ProvinciaService } from '../../../services/provincia.service';
import { IProvincia } from '../../../interfaces/IProvincia';
import { IDireccion } from '../interfaces/IDireccion';
import { ParentescoService } from '../../../services/parentesco.service';
import { IContacto } from '../../../interfaces/IContacto';
import * as enumerados from '../../../utils/enumerados';
import { PacienteService } from '../services/paciente.service';

@Component({
    selector: 'extranjero-nn-cru',
    templateUrl: 'extranjero-nn-cru.html'
})
export class ExtranjeroNNCruComponent implements OnInit {
    @Input() paciente: IPaciente;
    @Output() data: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

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

    contacto: IContacto = {
        tipo: 'celular',
        valor: '',
        ranking: 0,
        activo: true,
        ultimaActualizacion: new Date()
    };

    public relacion: IPacienteRelacion = {
        relacion: {
            id: '',
            nombre: '',
            opuesto: ''
        },
        referencia: '',
        nombre: '',
        apellido: '',
        documento: '',
        fechaNacimiento: null,
        sexo: ''
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
        financiador: null,
        identificadores: null,
        claveBlocking: null,
        scan: null,
        reportarError: false,
        notaError: ''
    };

    noPoseeContacto = false;
    tipoIdentificacion: any[];
    tipoComunicacion: any[];
    estados = [];
    sexos: any[];
    generos: any[];

    public pacientes: IPacienteMatch[] | IPaciente[];
    public showBuscador = true;

    paisArgentina = null;
    provinciaNeuquen = null;
    localidadNeuquen = null;
    viveEnNeuquen = false;
    viveProvNeuquen = false;
    barriosNeuquen: any[];
    localidadesNeuquen: any[] = [];
    provincias: IProvincia[] = [];
    parentescoModel: any[];

    constructor(
        private plex: Plex,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private parentescoService: ParentescoService,
        private pacienteService: PacienteService
    ) { }


    ngOnInit() {
        // Se cargan los parentescos para las relaciones
        this.parentescoService.get().subscribe(resultado => {
            this.parentescoModel = resultado;
        });

        // Se cargan enumerados
        this.sexos = enumerados.getObjSexos();
        this.generos = enumerados.getObjGeneros();
        this.tipoIdentificacion = enumerados.getObjTipoIdentificacion();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();

        // Se cargan provincias y localidades
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

        if (this.paciente && !this.isEmptyObject(this.paciente)) {
            this.actualizarDatosPaciente();
            if (this.paciente.id) {
                // Busco el paciente en mongodb (caso que no este en mongo y si en elastic server)
                this.pacienteService.getById(this.paciente.id)
                    .subscribe(resultado => {
                        if (resultado) {
                            this.paciente = Object.assign({}, resultado);
                            this.actualizarDatosPaciente();
                        }
                    });
            }
        }
    }

    actualizarDatosPaciente() {
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
    }


    isEmptyObject(obj) {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return JSON.stringify(obj) === JSON.stringify({});
    }

    // --------------- LOCALIDAD / PROVINCIA -----------------------

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
        // if (event.value) {
        //     this.loadBarrios(this.localidadNeuquen);
        // } else {
        //     this.barriosNeuquen = [];
        // }
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

    completarGenero() {
        if (!this.pacienteModel.genero) {
            this.pacienteModel.genero = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
        }
    }

    // ----------- CONTACTOS ------------------------------

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

    chequearContacto(key) {
        let index = this.pacienteModel.contacto.findIndex(item => item.tipo === key);
        if (index >= 0) {
            return true;
        } else {
            return false;
        }
    }

    limpiarContacto() {
        if (this.noPoseeContacto) {
            this.pacienteModel.contacto = [this.contacto];
        }
    }

    removeContacto(i) {
        if (i >= 0) {
            this.pacienteModel.contacto.splice(i, 1);
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

    // -------------- FOOTER ------------------------------

    cancel() {
        this.data.emit(null);
    }

    save(event) {
        console.log(this.pacienteModel);
    }
}
