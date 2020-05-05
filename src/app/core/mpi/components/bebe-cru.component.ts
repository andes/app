import { Component, AfterViewInit } from '@angular/core';
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
import { IContacto } from '../../../interfaces/IContacto';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'apps/mpi/bebe',
    templateUrl: 'bebe-cru.html'
})
export class BebeCruComponent implements AfterViewInit {

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
    contacto: IContacto = {
        tipo: 'celular',
        valor: '',
        ranking: 0,
        activo: true,
        ultimaActualizacion: new Date()
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
        notaError: '',
        vinculos: []
    };

    opcionesSexo: any[] = [{ id: 'femenino', label: 'Femenino' }, { id: 'masculino', label: 'Masculino' }];


    public pacientes: IPacienteMatch[] | IPaciente[];
    public showBuscador = true;
    changeRelaciones: boolean;
    paisArgentina = null;
    provinciaActual = null;
    localidadActual = null;
    localidadRequerida = true;
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
    noPoseeContacto = false;
    contactosCache = [];
    tipoComunicacion: any[];
    contactoImportado = false;
    direccionImportada = false;
    origen = '';

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
        private _router: Router,
        private route: ActivatedRoute
    ) {
        this.plex.updateTitle([{
            route: '/apps/mpi',
            name: 'MPI'
        }, {
            name: 'REGISTRO DE BEBÉ'
        }]);
    }


    ngAfterViewInit() {
        this.opcionesSexo = enumerados.getObjSexos();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.route.params.subscribe(params => {
            this.origen = params['origen'];
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
                    let direccionCompleta = org.direccion.valor + ', ' + this.localidadActual.nombre + ', ' + this.provinciaActual.nombre;
                    this.georeferenciaService.getGeoreferencia({ direccion: direccionCompleta }).subscribe(point => {
                        if (point) {
                            this.geoReferenciaAux = [point.lat, point.lng];
                        }
                    });
                }
            }
        });
    }

    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
            return;
        }
        if (resultado.pacientes.length === 1 && resultado.escaneado) {
            let pacienteScaneado = resultado.pacientes[0];
            if (!pacienteScaneado.id) {
                pacienteScaneado.estado = 'validado'; // este paciente fue scaneado
                pacienteScaneado.genero = pacienteScaneado.sexo;
                this.plex.showLoader();
                this.disableGuardar = true;
                this.pacienteService.save(pacienteScaneado, true).subscribe(
                    pacGuardado => {
                        this.onPacienteSelected(pacGuardado);
                        this.plex.hideLoader();
                        this.disableGuardar = false;
                    },
                    () => {
                        this.plex.toast('warning', 'Paciente no guardado', 'Error');
                        this.plex.hideLoader();
                        this.disableGuardar = false;
                    });
            } else {
                this.onPacienteSelected(pacienteScaneado);
            }
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

                /* Si no se cargó ninguna dirección, tomamos el dato de la madre/padre/tutor */
                this.copiarDireccion(paciente);
                /* Si no se cargó un contacto, tomamos el dato de la madre/padre/tutor */
                this.copiarContacto(paciente);
                this.pacientes = null;
                this.showBuscador = false;
            });
        } else {
            this.plex.info('warning', 'Imposible obtener el paciente seleccionado', 'Error');
        }
    }
    private copiarContacto(paciente: IPaciente) {
        if (!paciente.contacto || !paciente.contacto.length) { return; }
        if (!this.bebeModel.contacto[0].valor) {
            this.bebeModel.contacto[0].valor = paciente.contacto[0].valor;
            this.bebeModel.contacto[0].tipo = paciente.contacto[0].tipo;
            this.contactoImportado = true;
        }
    }

    private copiarDireccion(paciente: IPaciente) {
        if (!paciente.direccion || !paciente.direccion.length) { return; }
        if (!this.bebeModel.direccion[0].valor) {
            this.bebeModel.direccion[0].valor = paciente.direccion[0].valor;
            this.direccionImportada = true;
        }
        if (!this.bebeModel.direccion[0].ubicacion.provincia && paciente.direccion[0].ubicacion && paciente.direccion[0].ubicacion.provincia) {
            this.bebeModel.direccion[0].ubicacion.provincia = paciente.direccion[0].ubicacion.provincia;
            this.viveProvActual = (paciente.direccion[0].ubicacion.provincia.id === this.provinciaActual.id);
            this.direccionImportada = true;
        }
        if (!this.bebeModel.direccion[0].ubicacion.localidad && paciente.direccion[0].ubicacion.localidad) {
            this.bebeModel.direccion[0].ubicacion.localidad = paciente.direccion[0].ubicacion.localidad;
            this.viveLocActual = (paciente.direccion[0].ubicacion.localidad.id === this.localidadActual.id);
            if (paciente.direccion[0].geoReferencia) {
                this.bebeModel.direccion[0].geoReferencia = paciente.direccion[0].geoReferencia;
            }
            this.direccionImportada = true;
        }
        if (!this.bebeModel.direccion[0].ubicacion.provincia && !this.bebeModel.direccion[0].ubicacion.localidad) {
            this.localidadRequerida = true;
        }
        if (!this.bebeModel.direccion[0].ubicacion.barrio && paciente.direccion[0].ubicacion.barrio) {
            this.bebeModel.direccion[0].ubicacion.barrio = paciente.direccion[0].ubicacion.barrio;
            this.direccionImportada = true;
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
        this.localidadRequerida = false;
        if (provincia && provincia.id) {
            this.localidadService.getXProvincia(provincia.id).subscribe(result => {
                this.localidades = result;
                if (this.localidades && this.localidades.length) {
                    this.localidadRequerida = true;
                }

            });
        }
    }

    cancel() {
        this.redirect();
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
                if (dto.referencia && bebe.relaciones && bebe.relaciones.length) {
                    this.pacienteService.patch(bebe.relaciones[0].referencia, {
                        'op': 'updateRelacion',
                        'dto': dto
                    }).subscribe();
                }

                this.plex.info('success', 'Los datos se actualizaron correctamente');
                this.redirect(bebe);
            },
            error => {
                this.plex.info('warning', 'Error guardando el paciente');
            }
        );
    }

    private redirect(resultadoSave?: any) {
        switch (this.origen) {
            case 'puntoInicio':
                if (resultadoSave) {
                    this._router.navigate(['citas/punto-inicio/' + resultadoSave.id]);
                } else {
                    this._router.navigate(['citas/punto-inicio/']);
                }
                break;
            case 'mpi':
                this._router.navigate(['apps/mpi/busqueda']);
                break;
            case 'sobreturno':
                this._router.navigate(['citas/gestor_agendas']);
                break;
            default:
                this._router.navigate(['apps/mpi/busqueda']);
                break;
        }

    }

    cambiarRelacion() {
        this.showBuscador = true;
        // si los datos direccion/contacto fueron obtenidos de la relación, se resetean.
        if (this.direccionImportada) {
            this.bebeModel.direccion[0].valor = '';
            this.bebeModel.direccion[0].ubicacion.localidad = null;
            this.bebeModel.direccion[0].ubicacion.provincia = null;
            this.direccionImportada = false;
        }
        if (this.contactoImportado) {
            this.bebeModel.contacto[0].valor = '';
            this.bebeModel.contacto[0].tipo = 'celular';
            this.contactoImportado = false;
        }
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

    addContacto(key, valor) {
        let indexUltimo = this.bebeModel.contacto.length - 1;

        if (this.bebeModel.contacto[indexUltimo].valor) {
            let nuevoContacto = Object.assign({}, {
                tipo: key,
                valor: valor,
                ranking: 0,
                activo: true,
                ultimaActualizacion: new Date()
            });

            this.bebeModel.contacto.push(nuevoContacto);
        } else {
            this.plex.toast('info', 'Debe completar los contactos anteriores.');
        }
    }

    removeContacto(i) {
        if (i >= 0) {
            this.bebeModel.contacto.splice(i, 1);
        }
    }

    // Guarda los contactos cuando se tilda "no posee contactos", para recuperarlos en caso de destildar el box.
    limpiarContacto() {
        if (this.noPoseeContacto) {
            this.contactosCache = this.bebeModel.contacto;
            this.bebeModel.contacto = [this.contacto];
        } else {
            this.bebeModel.contacto = this.contactosCache;
        }
    }

    verificarCorreoValido(indice, form) {
        let formato = /^[a-zA-Z0-9_.+-]+\@[a-zA-Z0-9-]+(\.[a-z]{2,4})+$/;
        let mail = String(this.bebeModel.contacto[indice].valor);
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

}
