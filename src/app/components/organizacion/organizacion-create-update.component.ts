import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { SnomedService } from '../../apps/mitos';
import { ISnapshot } from '../../apps/rup/mapa-camas/interfaces/ISnapshot';
import { MapaCamasHTTP } from '../../apps/rup/mapa-camas/services/mapa-camas.http';
import { IDireccion } from '../../core/mpi/interfaces/IDireccion';
import { IContacto } from './../../interfaces/IContacto';
import { IEdificio } from './../../interfaces/IEdificio';
// Interfaces
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { ITipoEstablecimiento } from './../../interfaces/ITipoEstablecimiento';
import { IUbicacion } from './../../interfaces/IUbicacion';
import { IZonaSanitaria } from './../../interfaces/IZonaSanitaria';
import { LocalidadService } from './../../services/localidad.service';
import { OrganizacionService } from './../../services/organizacion.service';
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
// Services
import { TipoEstablecimientoService } from './../../services/tipoEstablecimiento.service';
import { ZonaSanitariaService } from './../../services/zonaSanitaria.service';
import * as enumerados from './../../utils/enumerados';




@Component({
    selector: 'organizacion-create-update',
    templateUrl: 'organizacion-create-update.html',
    styles: [`
        .map-container {
            width: 50vw;
        }
    `]
})
export class OrganizacionCreateUpdateComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    @Input() seleccion: IOrganizacion;
    @Output() data: EventEmitter<IOrganizacion> = new EventEmitter<IOrganizacion>();

    // definición de arreglos
    tiposEstablecimiento$: Observable<ITipoEstablecimiento[]>;
    zonasSanitarias$: Observable<IZonaSanitaria[]>;
    tipoComunicacion: any[];
    todasLocalidades: ILocalidad[];
    provincias$: Observable<any[]>;
    private localidades = new Subject();
    localidades$: Observable<any[]>;
    servicio;
    private paisArgentina = null;
    // con esta query de snomed trae todos los servicios.
    private expression = '<<284548004';

    tipoEstablecimiento: ITipoEstablecimiento = {
        nombre: '',
        descripcion: '',
        clasificacion: '',
        idTipoEfector: 0,
    };

    ubicacion: IUbicacion = {
        barrio: null,
        localidad: null,
        provincia: null,
        pais: null
    };

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
        ubicacion: this.ubicacion,
        ranking: 0,
        geoReferencia: null,
        ultimaActualizacion: new Date(),
        activo: true
    };

    edificio: IEdificio = {
        id: null,
        descripcion: '',
        contacto: this.contacto,
        direccion: this.direccion,
    };

    organizacionModel: any = {
        id: null,
        codigo: {
            sisa: '',
            cuie: '',
            remediar: ''
        },
        nombre: '',
        tipoEstablecimiento: this.tipoEstablecimiento,
        direccion: this.direccion,
        contacto: [this.contacto],
        edificio: [this.edificio],
        nivelComplejidad: 0,
        activo: true,
        fechaAlta: new Date(),
        fechaBaja: new Date(),
        unidadesOrganizativas: [],
        ofertaPrestacional: { idSisa: Number, nombre: String },
        showMapa: false,
        zonaSanitaria: null
    };

    public listadoUO = [];

    public noPoseeContacto;
    private contactosCache = []; // se guardan los contactos ingresados en cache para poder recuperarlos en caso de equivocacion al tildar checkbox "no posee contacto"
    public noPoseeEdificio;
    private edificiosCache = []; // se guardan los edficios ingresados en cache para poder recuperarlos en caso de equivocacion al tildar checkbox "no posee edificio"

    // Datos para el mapa
    // initial center position for the map
    public lat: number;
    public lng: number;

    public zoom = 12;

    public marker: {
        lng: number;
        lat: number;
        infofiltro?: string;
    };
    // fin datos para el mapa

    public puedeEditarCompleto = false;
    public puedeEditarBasico = false;
    public botonGuardarDisabled = false;

    public camas: ISnapshot[];
    constructor(
        private organizacionService: OrganizacionService,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private tipoEstablecimientoService: TipoEstablecimientoService,
        public plex: Plex,
        public snomed: SnomedService,
        private auth: Auth,
        private router: Router,
        private zonasSanitariasService: ZonaSanitariaService,
        public mapaCamasService: MapaCamasHTTP,
    ) { }

    ngOnInit() {
        this.puedeEditarBasico = this.auth.check('tm:organizacion:editBasico');
        this.puedeEditarCompleto = this.auth.check('tm:organizacion:editCompleto');

        this.mapaCamasService.snapshot('internacion', 'medica', moment().toDate()).subscribe((snapshot) => {
            this.camas = snapshot.filter(s => s.estado !== 'inactiva');
        });

        if ((this.seleccion && this.seleccion.id && !(this.puedeEditarBasico || this.puedeEditarCompleto)) ||
            (!this.seleccion && !this.auth.check('tm:organizacion:create'))) {
            this.router.navigate(['inicio']);
        }

        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.tiposEstablecimiento$ = this.tipoEstablecimientoService.get();
        this.zonasSanitarias$ = this.zonasSanitariasService.search().pipe(cache());

        this.cargarOrganizacionModel(this.seleccion);

        // Set País Argentina
        this.paisService.get({
            nombre: 'Argentina'
        }).subscribe(arg => {
            this.paisArgentina = arg[0];
        });

        this.provincias$ = this.provinciaService.get({});
        const provincia = this.organizacionModel.direccion.ubicacion.provincia;
        const provinciaId = provincia ? provincia.id : null;
        this.localidades$ = this.localidades.pipe(
            startWith(provinciaId),
            switchMap((_provincia: any) => _provincia ? this.localidadService.get({ 'provincia': _provincia }) : of([])),
            cache()
        );
        this.noPoseeContacto = this.seleccion && this.seleccion.contacto ? true : false; // Indica si está tildado o no el checkbox de si tiene contacto la organizacion
        this.noPoseeEdificio = this.seleccion && this.seleccion.edificio ? true : false; // Indica si está tildado o no el checkbox de si quiere cargar edificios o no
    }

    onSelectProvincia() {
        this.organizacionModel.direccion.ubicacion.localidad = null;
        this.organizacionModel.edificio.forEach(e => e.direccion.ubicacion.localidad = null);
        const provincia = this.organizacionModel.direccion.ubicacion.provincia;
        const provinciaId = provincia ? provincia.id : null;
        this.localidades.next(provinciaId);
    }

    private cargarOrganizacionModel(org: IOrganizacion) {
        if (org && org.id) {
            this.updateTitle('Editar organización');
            Object.assign(this.organizacionModel, org);
            if (this.organizacionModel && this.organizacionModel.direccion && this.organizacionModel.direccion.geoReferencia && this.organizacionModel.direccion.geoReferencia.length === 2) {
                this.lat = this.organizacionModel.direccion.geoReferencia[0];
                this.lng = this.organizacionModel.direccion.geoReferencia[1];
            }
            if (this.organizacionModel && (!this.organizacionModel.contacto || this.organizacionModel.contacto.length < 1)) {
                this.addContacto();
            }
            if (this.organizacionModel && (!this.organizacionModel.edificio || this.organizacionModel.edificio.length < 1)) {
                this.addEdificio();
            }
        } else {
            this.updateTitle('Nueva organización');
        }
    }
    loadListadoUO(event) {
        this.snomed.getQuery({ expression: this.expression }).subscribe((result) => {
            this.organizacionModel.unidadesOrganizativas.forEach((uo) => {
                result = result.filter(item => item.conceptId !== uo.conceptId);
            });
            event.callback(result);
        });
    }

    onSave(valid) {
        if (valid.formValid) {
            const organizacionGuardar = Object.assign({}, this.organizacionModel);
            organizacionGuardar.contacto.map(elem => {
                elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
                return elem;
            });
            if (organizacionGuardar.edificio) {
                organizacionGuardar.edificio.forEach(e => {
                    if (e.contacto) {
                        e.contacto.tipo = ((typeof e.contacto.tipo === 'string') ? e.contacto.tipo : (Object(e.contacto.tipo).id));
                    }
                    e.direccion.ubicacion.pais = this.paisArgentina;
                    e.direccion.ubicacion.provincia = organizacionGuardar.direccion.ubicacion.provincia;
                    e.direccion.ubicacion.barrio = null;
                });
            }
            organizacionGuardar.direccion.ubicacion.pais = this.paisArgentina;
            organizacionGuardar.direccion.ubicacion.barrio = null;

            const operacion = this.organizacionService.save(organizacionGuardar);
            operacion.subscribe(result => {
                if (result) {
                    this.plex.info('success', 'Los datos se actualizaron correctamente');
                    this.data.emit(result);
                } else {
                    this.plex.info('warning', 'ERROR: Ocurrió un problema al actualizar los datos');
                }
            });
        } else {
            this.plex.toast('danger', 'Ingrese todos los campos requeridos.');
        }
    }

    onCancel() {
        window.setTimeout(() => this.data.emit(null), 100);
    }

    addContacto() {
        const nuevoContacto = Object.assign({}, {
            tipo: 'celular',
            valor: '',
            ranking: 0,
            activo: true,
            ultimaActualizacion: new Date()
        });
        if (this.noPoseeContacto) {
            this.organizacionModel.contacto = [nuevoContacto];
            this.noPoseeContacto = false;
        } else {
            this.organizacionModel.contacto.push(nuevoContacto);
        }
    }

    removeContacto(i) {
        if (i >= 0) {
            this.organizacionModel.contacto.splice(i, 1);
        }
        if (!this.organizacionModel.contacto.length) {
            this.noPoseeContacto = true;
        }
    }

    addEdificio() {
        const nuevoEdificio = Object.assign({}, {
            id: null,
            descripcion: '',
            contacto: {
                tipo: 'celular',
                valor: '',
                ranking: 0,
                activo: true,
                ultimaActualizacion: new Date()
            },
            direccion: {
                valor: '',
                codigoPostal: '',
                ubicacion: {
                    barrio: {
                        id: '',
                        nombre: ''
                    },
                    localidad: {
                        id: '',
                        nombre: ''
                    },
                    provincia: {
                        id: '',
                        nombre: ''
                    },
                    pais: {
                        id: '',
                        nombre: ''
                    }
                },
                ranking: 0,
                geoReferencia: null,
                ultimaActualizacion: new Date(),
                activo: true
            },
        });
        if (this.noPoseeEdificio) {
            this.organizacionModel.edificio = [nuevoEdificio];
            this.noPoseeEdificio = false;
        } else {
            this.organizacionModel.edificio.push(nuevoEdificio);
        }
    }

    removeEdificio(i) {
        if (i >= 0) {
            this.organizacionModel.edificio.splice(i, 1);
        }
        if (!this.organizacionModel.edificio.length) {
            this.noPoseeEdificio = true;
        }
    }

    routeCama() {
        this.router.navigate([`/tm/organizacion/"${this.seleccion.id}"/cama`]);
    }


    addU0() {
        if (this.servicio && this.organizacionModel.unidadesOrganizativas.indexOf(this.servicio) === -1) { // TODO: agregar validacion de que haya cargado un servicio
            this.organizacionModel.unidadesOrganizativas.push(this.servicio);
        }
    }
    deleteUO($event) {
        if ($event.conceptId) {
            this.plex.confirm('¿Desea eliminar?', 'Eliminar unidad organizativa').then((confirmar) => {
                const index = this.organizacionModel.unidadesOrganizativas.findIndex((item) => item === $event);
                if (confirmar && index >= 0) {
                    this.organizacionModel.unidadesOrganizativas.splice(index, 1);
                }
            });
        }
    }

    /**
     * Guarda los contactos cuando se tilda "no posee contactos", para recuperarlos en caso de destildar el box
     * @memberof OrganizacionCreateUpdateComponent
     */
    limpiarContacto() {
        if (this.noPoseeContacto) {
            this.contactosCache = this.organizacionModel.contacto;
            this.organizacionModel.contacto = [this.contacto];
        } else if (this.contactosCache?.length) {
            this.organizacionModel.contacto = this.contactosCache;
        } else {
            this.addContacto();
        }
    }
    /**
    * Guarda los edificios cuando se tilda "no posee edificios", para recuperarlos en caso de destildar el box
    * @memberof OrganizacionCreateUpdateComponent
    */
    limpiarEdificio() {
        if (this.noPoseeEdificio) {
            this.edificiosCache = this.organizacionModel.edificio;
            this.organizacionModel.edificio = [this.edificio];
        } else if (this.edificiosCache?.length) {
            this.organizacionModel.edificio = this.edificiosCache;
        } else {
            this.addEdificio();
        }
    }
    private updateTitle(nombre: string) {
        this.plex.updateTitle('Tablas maestras / ' + nombre);
    }

    /**
     * Busca la organización en el servidor SISA y carga los datos disponibles en el formulario
     * @memberof OrganizacionCreateUpdateComponent
     */
    public sincronizarSisa() {
        this.organizacionService.getOrgSisa(this.organizacionModel.codigo.sisa).subscribe(res => {
            if (res.resultado === 'OK') {
                if (res.nombre && this.puedeEditarCompleto) {
                    this.organizacionModel.nombre = res.nombre;
                }
                if (res.domicilio) {
                    if (res.domicilio.direccion) {
                        this.organizacionModel.direccion.valor = res.domicilio.direccion;
                    }
                    if (res.domicilio.codigoPostal) {
                        this.organizacionModel.direccion.codigoPostal = res.domicilio.codigoPostal;
                    }
                }
                const resCoord = res.coordenadasDeMapa;
                const geoReferenciaValida = resCoord?.latitud && resCoord.latitud !== 'null' && resCoord.longitud && resCoord.longitud !== 'null';
                if (geoReferenciaValida) {
                    if (!this.organizacionModel.direccion.geoReferencia) {
                        this.organizacionModel.direccion.geoReferencia = new Array<number>(2);
                    }
                    this.organizacionModel.direccion.geoReferencia[0] = Number(resCoord.latitud);
                    this.organizacionModel.direccion.geoReferencia[1] = Number(resCoord.longitud);
                }
                if (res.ofertaPrestacional) {
                    this.organizacionModel.ofertaPrestacional = res.ofertaPrestacional;
                }
                this.plex.toast('success', 'Sincronización con fuentes autenticas.', 'La organización se sincronizó satisfactoriamente');

            } else {
                this.plex.info('warning', 'El código SISA no existe.', 'No sincronizó');
            }
        });
    }

    // Verifica si la Unidad Organizativa está siendo utilizada en alguna cama de internación
    checkUnidadOrganizativaCama(unidadOrganizativa) {
        if (this.camas) {
            const aux = this.camas.filter(cama => cama.unidadOrganizativa.conceptId === unidadOrganizativa.conceptId);
            return (aux.length > 0);
        }
        return false;
    }

    /**
     * Setea las coordenadas de la organización a la ubicación donde se soltó el marcador en el mapa
     * @param {*} event
     * @memberof OrganizacionCreateUpdateComponent
     */
    public movioMarker(event) {
        this.organizacionModel.direccion.geoReferencia[0] = event.coords.lat;
        this.organizacionModel.direccion.geoReferencia[1] = event.coords.lng;
    }

    validarUnicoCodigoSisa() {
        if (this.organizacionModel.codigo.sisa) {
            this.organizacionService.get({ sisa: this.organizacionModel.codigo.sisa }).subscribe(organizaciones => { // Se llama dos veces cuando estoy suscripto. Al hardcodear el mensaje puedo
                this.botonGuardarDisabled = false;
                if (organizaciones && organizaciones.length && // si trajo resultados
                    (!this.organizacionModel.id || this.organizacionModel.id !== organizaciones[0].id)) { // y estoy creando o editando una organizacion diferente a la que trajo

                    this.auth.organizaciones().subscribe((organizacionesUser: any) => {
                        const tienePermisosParaOrgEncontrada = organizacionesUser.some((orgUser: any) => {
                            return orgUser.id === organizaciones[0].id;
                        });
                        if (tienePermisosParaOrgEncontrada) {
                            this.plex.confirm(`¿Desea editar la organización ${organizaciones[0].nombre}?`, 'Existe otra organización con mismo código SISA').then((resultado: any) => {
                                if (resultado) {
                                    this.cargarOrganizacionModel(organizaciones[0]);
                                } else {
                                    this.continuarConOrganizacionRepetida();
                                }
                            });
                        } else {
                            this.plex.info('warning', `La organización ${organizaciones[0].nombre} tiene el mismo código SISA.`); // TODO: cuando plex lo permita, cambiar el cartel de Texto requerido por 'Otra organización tiene el mismo código'
                            this.continuarConOrganizacionRepetida();
                        }
                    });
                }
            });
        }
    }
    private continuarConOrganizacionRepetida(): any {
        this.botonGuardarDisabled = true;
        this.organizacionModel.codigo.sisa = null;
    }
}


