import { Component, OnInit } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { PacienteBuscarResultado } from '../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { Plex } from '@andes/plex';
import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { LocalidadService } from '../../../services/localidad.service';
import { ProvinciaService } from '../../../services/provincia.service';
import { IProvincia } from '../../../interfaces/IProvincia';
import { IDireccion } from '../interfaces/IDireccion';
import { ParentescoService } from '../../../services/parentesco.service';
import { PacienteService } from '../services/paciente.service';
import { PaisService } from '../../../services/pais.service';
import { Location } from '@angular/common';

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
    viveProvNeuquen = false;
    viveEnNeuquen = false;
    barriosNeuquen: any[];
    localidadesNeuquen: any[] = [];
    provincias: IProvincia[] = [];
    parentescoModel: any[];

    constructor(
        private location: Location,
        private plex: Plex,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private parentescoService: ParentescoService,
        private pacienteService: PacienteService,
        private paisService: PaisService,
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
        if (paciente) {
            this.relacion.apellido = paciente.apellido;
            this.relacion.nombre = paciente.nombre;
            this.relacion.documento = paciente.documento;
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
            if (!this.bebeModel.direccion[0].valor && !this.bebeModel.direccion[0].ubicacion.provincia &&
                paciente.direccion && paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.provincia
                && paciente.direccion[0].ubicacion.provincia.nombre === 'Neuquén') {

                this.viveProvNeuquen = true;
                this.bebeModel.direccion[0].valor = paciente.direccion[0].valor;
                this.bebeModel.direccion[0].ubicacion.provincia = paciente.direccion[0].ubicacion.provincia;

                if (paciente.direccion[0].ubicacion.localidad && paciente.direccion[0].ubicacion.localidad.nombre === 'Neuquén') {
                    this.viveEnNeuquen = true;
                    this.bebeModel.direccion[0].ubicacion.localidad = paciente.direccion[0].ubicacion.localidad;
                } else {
                    this.localidadService.getXProvincia(paciente.direccion[0].ubicacion.provincia.id).subscribe(result => {
                        this.localidadesNeuquen = result;
                        this.bebeModel.direccion[0].ubicacion.localidad = paciente.direccion[0].ubicacion.localidad;
                    });
                }
                this.pacientes = null;
                this.showBuscador = false;
            } else {
                this.pacientes = null;
                this.showBuscador = false;
            }
        } else {
            this.plex.info('warning', 'Imposible obtener el paciente seleccionado', 'Error');
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
            this.bebeModel.direccion[0].ubicacion.provincia = this.provinciaNeuquen;
        } else {
            this.bebeModel.direccion[0].ubicacion.provincia = null;
            this.localidadesNeuquen = [];
        }

    }
    loadProvincias(event, pais) {
        if (pais && pais.id) {
            this.provinciaService.get({
                pais: pais.id
            }).subscribe(event.callback);
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
            this.bebeModel.direccion[0].ubicacion.localidad = this.localidadNeuquen;
        } else {
            this.bebeModel.direccion[0].ubicacion.localidad = null;
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
        this.location.back();
    }

    save(event) {
        if (!event.formValid) {
            this.plex.info('warning', 'Debe completar los datos obligatorios');
            return;
        }
        // Si aún no elegió una relación (showBuscardor=true) no debe dejar guardar
        if (this.showBuscador && event.formValid) {
            this.plex.info('warning', 'Agregue la relación de madre o padre', 'Información Faltante');
        } else {
            this.bebeModel.genero = this.bebeModel.sexo;
            this.pacienteService.save(this.bebeModel).subscribe(
                () => {
                    this.plex.info('success', 'Los datos se actualizaron correctamente');
                    this.location.back();
                },
                () => {
                    this.plex.info('warning', 'Paciente no guardado', 'Error de conexión');
                });
        }
    }

    cambiarRelacion() {
        this.showBuscador = true;
        this.bebeModel.direccion[0].valor = null;
        this.bebeModel.direccion[0].ubicacion.localidad = null;
        this.bebeModel.direccion[0].ubicacion.provincia = null;
    }
}
