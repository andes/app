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
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { OrganizacionService } from '../../../services/organizacion.service';
import { Auth } from '@andes/auth';
import { BarrioService } from '../../../services/barrio.service';
import { GeoreferenciaService } from '../services/georeferencia.service';
import * as enumerados from './../../../utils/enumerados';

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
        sexo: '',
        foto: ''
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
    changeRelaciones: boolean;
    paisArgentina = null;
    provinciaActual = null;
    localidadActual = null;
    viveProvActual = false;
    viveLocActual = false;
    barrios: any[] = [];
    localidades: any[] = [];
    provincias: IProvincia[] = [];
    parentescoModel: any[];
    hoy = moment().endOf('day').toDate();
    disableGuardar = false;
    enableIgnorarGuardar = false;
    organizacionActual = null;
    geoReferenciaAux = []; // Se utiliza para chequear cambios.
    infoMarcador: String = null;

    constructor(
        private georeferenciaService: GeoreferenciaService,
        private barriosService: BarrioService,
        private organizacionService: OrganizacionService,
        private auth: Auth,
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
        this.opcionesSexo = enumerados.getObjSexos();

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

        this.organizacionService.getById(this.auth.organizacion.id).subscribe((org: IOrganizacion) => {
            if (org) {
                this.organizacionActual = org;
                this.provinciaActual = org.direccion.ubicacion.provincia;
                this.localidadActual = org.direccion.ubicacion.localidad;
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
        // ubicacion inicial mapa de google en seccion domicilio
        // Por defecto el mapa se posiciona referenciando al centro de salud actual
        // this.organizacionService.getGeoreferencia(this.auth.organizacion.id).subscribe(point => {
        //     if (point) {
        //         this.geoReferenciaAux = [point.lat, point.lng];
        //         this.infoMarcador = this.auth.organizacion.nombre;
        //     }
        // });
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

    onPacienteSelected(pacienteSelected: IPaciente) {
        if (pacienteSelected) {
            this.pacienteService.getById(pacienteSelected.id).subscribe(paciente => {
                // Relacionamos al bebe con su progenitor/a
                this.relacion.apellido = paciente.apellido;
                this.relacion.nombre = paciente.nombre;
                this.relacion.documento = paciente.documento;
                this.relacion.fechaNacimiento = paciente.fechaNacimiento;
                this.relacion.sexo = paciente.sexo;
                this.relacion.foto = paciente.foto ? paciente.foto : null;
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
                    this.bebeModel.direccion[0].valor = paciente.direccion[0].valor;
                }
                if (!this.bebeModel.direccion[0].ubicacion.provincia && paciente.direccion && paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.provincia) {
                    this.bebeModel.direccion[0].ubicacion.provincia = paciente.direccion[0].ubicacion.provincia;
                    this.viveProvActual = (paciente.direccion[0].ubicacion.provincia.id === this.provinciaActual.id);
                }
                if (!this.bebeModel.direccion[0].ubicacion.localidad && paciente.direccion && paciente.direccion[0].ubicacion.localidad) {
                    this.bebeModel.direccion[0].ubicacion.localidad = paciente.direccion[0].ubicacion.localidad;
                    this.viveLocActual = (paciente.direccion[0].ubicacion.localidad.id === this.localidadActual.id);

                    if (paciente.direccion[0].geoReferencia) {
                        this.bebeModel.direccion[0].geoReferencia = paciente.direccion[0].geoReferencia;
                    }
                }
                if (!this.bebeModel.direccion[0].ubicacion.barrio && paciente.direccion && paciente.direccion[0].ubicacion.barrio) {
                    this.bebeModel.direccion[0].ubicacion.barrio = paciente.direccion[0].ubicacion.barrio;
                }
                this.pacientes = null;
                this.showBuscador = false;
            });
        } else {
            this.plex.info('warning', 'Imposible obtener el paciente seleccionado', 'Error');
        }
    }
    /**
    * Change del plex-bool viveProvActual
    * carga las localidades correspondientes a la provincia del efector
    * @param {any} event
    *
    * @memberOf PacienteCreateUpdateComponent
    */
    changeProvActual(event) {
        if (event.value) {
            this.bebeModel.direccion[0].ubicacion.provincia = this.provinciaActual;
            this.loadLocalidades(this.provinciaActual);
        } else {
            this.viveLocActual = false;
            this.localidades = [];
            this.bebeModel.direccion[0].ubicacion.provincia = null;
            this.bebeModel.direccion[0].ubicacion.localidad = null;
            this.bebeModel.direccion[0].ubicacion.barrio = null;
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
     * Change del plex-bool viveLocalidadActual
     * carga los barrios de la provincia del efector
     * @param {any} event
     *
     * @memberOf PacienteCreateUpdateComponent
     */
    changeLocalidadActual(event) {
        if (event.value) {
            this.bebeModel.direccion[0].ubicacion.localidad = this.localidadActual;
            this.loadBarrios(this.localidadActual);
        } else {
            this.bebeModel.direccion[0].ubicacion.localidad = null;
            this.bebeModel.direccion[0].ubicacion.barrio = null;
            this.barrios = [];
        }
    }


    loadLocalidades(provincia) {
        if (provincia && provincia.id) {
            this.localidadService.getXProvincia(provincia.id).subscribe(result => {
                this.localidades = result;
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
        this.disableGuardar = true;
        let bebeGuardar: any = Object.assign({}, this.bebeModel);
        bebeGuardar.tipoIdentificacion = ((typeof this.bebeModel.tipoIdentificacion === 'string')) ? this.bebeModel.tipoIdentificacion : (Object(this.bebeModel.tipoIdentificacion).id);
        bebeGuardar.sexo = ((typeof this.bebeModel.sexo === 'string')) ? this.bebeModel.sexo : (Object(this.bebeModel.sexo).id);
        bebeGuardar.estadoCivil = this.bebeModel.estadoCivil ? ((typeof this.bebeModel.estadoCivil === 'string')) ? this.bebeModel.estadoCivil : (Object(this.bebeModel.estadoCivil).id) : null;
        bebeGuardar.genero = ((typeof this.bebeModel.sexo === 'string')) ? this.bebeModel.sexo : (Object(this.bebeModel.sexo).id);
        bebeGuardar.contacto.map(elem => {
            elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
            return elem;
        });
        bebeGuardar.direccion[0].ubicacion.pais = this.paisArgentina;
        if (this.viveProvActual) {
            bebeGuardar.direccion[0].ubicacion.provincia = this.provinciaActual;
        }
        if (this.viveLocActual) {
            bebeGuardar.direccion[0].ubicacion.localidad = this.localidadActual;
        }
        this.pacienteService.save(bebeGuardar).subscribe(
            bebe => {
                // Cargamos al bebe como hijo/a de su progrnitor/a
                let relacionOpuesta = this.parentescoModel.find((elem) => {
                    if (elem.nombre === this.relacion.relacion.opuesto) {
                        return elem;
                    }
                });
                let dto = {
                    relacion: relacionOpuesta,
                    referencia: bebe.id,
                    nombre: bebe.nombre,
                    apellido: bebe.apellido,
                    documento: bebe.documento,
                    foto: bebe.foto ? bebe.foto : null
                };
                if (dto.referencia && bebe.relaciones.length) {
                    this.pacienteService.patch(bebe.relaciones[0].referencia, {
                        'op': 'updateRelacion',
                        'dto': dto
                    }).subscribe();
                }

                this.plex.info('success', 'Los datos se actualizaron correctamente');
                this.location.back();
            },
            error => {
                this.plex.info('warning', 'Error guardando el paciente');
            }
        );
    }


    cambiarRelacion() {
        this.showBuscador = true;
        this.bebeModel.direccion[0].valor = '';
        this.bebeModel.direccion[0].ubicacion.localidad = null;
        this.bebeModel.direccion[0].ubicacion.provincia = null;
        this.viveLocActual = false;
        this.viveProvActual = false;
    }

    notasNotification(notasNew) {
        this.bebeModel.notas = notasNew;
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

    changeCoordenadas(coordenadas) {
        this.geoReferenciaAux = coordenadas;    // Se actualiza vista del mapa
        this.bebeModel.direccion[0].geoReferencia = coordenadas;    // Se asigna nueva georeferencia al paciente
    }
    actualizarMapa() {
        // campos de direccion completos?
        if (this.bebeModel.direccion[0].valor && this.bebeModel.direccion[0].ubicacion.provincia && this.bebeModel.direccion[0].ubicacion.localidad) {
            let direccionCompleta = this.bebeModel.direccion[0].valor + ', ' + this.bebeModel.direccion[0].ubicacion.localidad.nombre
                + ', ' + this.bebeModel.direccion[0].ubicacion.provincia.nombre;
            // se calcula nueva georeferencia
            this.georeferenciaService.getGeoreferencia({ direccion: direccionCompleta }).subscribe(point => {
                if (point) {
                    this.geoReferenciaAux = [point.lat, point.lng]; // se actualiza vista de mapa
                    this.bebeModel.direccion[0].geoReferencia = [point.lat, point.lng]; // Se asigna nueva georeferencia al paciente
                    this.infoMarcador = '';
                } else {
                    this.plex.toast('warning', 'Dirección no encontrada. Señale manualmente en el mapa.');
                }
            });

        } else {
            this.plex.toast('info', 'Debe completar datos del domicilio.');
        }
    }
}
