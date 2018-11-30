import { Component, OnInit } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { PacienteBuscarResultado } from '../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { Plex } from '@andes/plex';
import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { BarrioService } from '../../../services/barrio.service';
import { PaisService } from '../../../services/pais.service';
import { LocalidadService } from '../../../services/localidad.service';
import { ProvinciaService } from '../../../services/provincia.service';
import { IProvincia } from '../../../interfaces/IProvincia';
import { IDireccion } from '../interfaces/IDireccion';
import { ParentescoService } from '../../../services/parentesco.service';
import { PacienteService } from '../services/paciente.service';

@Component({
    selector: 'apps/mpi/bebe',
    templateUrl: 'bebe-cru.html'
})
export class BebeCruComponent implements OnInit {

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

    public bebeModel: IPaciente = {
        id: null,
        documento: '',
        cuil: null,
        activo: true,
        estado: 'temporal',
        nombre: '',
        apellido: '',
        nombreCompleto: '',
        alias: '',
        contacto: [],
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

    opcionesSexo: any[] = [{ id: 'femenino', label: 'Femenino' }, { id: 'masculino', label: 'Masculino' }];


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
        private barrioService: BarrioService,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private parentescoService: ParentescoService,
        private pacienteService: PacienteService
    ) {
        this.plex.updateTitle([{
            route: '/apps/mpi',
            name: 'MPI'
        }, {
            name: 'REGISTRO DE BEBÉ'
        }]);
    }


    ngOnInit() {
        // Se cargan los parentescos para las relaciones
        this.parentescoService.get().subscribe(resultado => {
            this.parentescoModel = resultado;
        });
    }

    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.pacientes = resultado.pacientes;
        }
    }

    searchClear() {
        this.pacientes = null;
    }

    onPacienteSelected(paciente: IPaciente) {
        this.relacion.apellido = paciente.apellido;
        this.relacion.nombre = paciente.nombre;
        this.relacion.documento = paciente.documento;
        this.relacion.fechaNacimiento = paciente.fechaNacimiento;
        this.relacion.fechaNacimiento = paciente.fechaNacimiento;
        this.relacion.sexo = paciente.sexo;
        this.relacion.referencia = paciente.id;
        let rel = this.parentescoModel.find((elem) => {
            if (elem.nombre === 'progenitor/a') {
                return elem;
            }
        });
        this.relacion.relacion = rel;
        this.bebeModel.relaciones = [this.relacion];
        /* Si no se cargó ninguna dirección, tomamos el dato de la madre */
        if (!this.bebeModel.direccion[0].valor) {
            this.bebeModel.direccion = paciente.direccion;
        }
        this.pacientes = null;
        this.showBuscador = false;
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

    cancel() {
        // TODO navegar atrás
    }

    save(event) {
        // if (this.showBuscador && event.formValid) {
        //     this.plex.info('warning', 'Agregue la relación de madre o padre', 'Información Faltante');
        // } else {
        //     console.log(this.bebeModel);
        //     this.pacienteSave.preSave(this.bebeModel);
        // }
    }

    cambiarRelacion() {
        this.showBuscador = true;
    }


}
