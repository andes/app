import { Component, Input, OnInit, Output, EventEmitter, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { IContacto } from '../../../interfaces/IContacto';
import { IProvincia } from '../../../interfaces/IProvincia';
import { IBarrio } from '../../../interfaces/IBarrio';
import { ILocalidad } from '../../../interfaces/ILocalidad';
import { Plex } from '@andes/plex';
import { GeoreferenciaService } from '../services/georeferencia.service';
import { OrganizacionService } from '../../../services/organizacion.service';
import { IDireccion } from '../interfaces/IDireccion';
import { PaisService } from '../../../services/pais.service';
import { ProvinciaService } from '../../../services/provincia.service';
import { BarrioService } from '../../../services/barrio.service';
import { LocalidadService } from '../../../services/localidad.service';
import { Auth } from '@andes/auth';
import * as enumerados from '../../../utils/enumerados';
import { Subscription, Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import { cache } from '@andes/shared';
import { switchMap, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
    selector: 'datos-contacto',
    templateUrl: 'datos-contacto.html',
    styleUrls: []
})

export class DatosContactoComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() paciente: IPaciente;
    @Output() changes: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('form', null) ngForm: NgForm;
    formChangesSubscription: Subscription;

    // Contacto
    contacto: IContacto = {
        tipo: 'celular',
        valor: '',
        ranking: 0,
        activo: true,
        ultimaActualizacion: new Date()
    };
    noPoseeContacto = false;
    contactosCache = [];
    tipoComunicacion: any[];
    public organizacion$: Observable<any>;
    public paises$: Observable<any>;
    public provincias$: Observable<any>;
    public localidades$: Observable<any>;
    public barrios$: Observable<any>;
    public ubicacion$: Observable<any>;
    public georeferencia$: Observable<any>;

    // Domicilio
    public direccion: IDireccion = {
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
    viveLocActual = false;
    viveProvActual = false;
    provincias: IProvincia[] = [];
    // barrios: IBarrio[] = [];
    localidades: ILocalidad[] = [];
    disableGeolocalizar = true;
    paisArgentina = null;
    provinciaActual = null;
    localidadActual = null;
    localidadRequerida = true;
    organizacionActual = null;

    // Mapa
    geoReferenciaAux = []; // Coordenadas para la vista del mapa.
    infoMarcador: String = null;


    constructor(
        private auth: Auth,
        private plex: Plex,
        private georeferenciaService: GeoreferenciaService,
        private organizacionService: OrganizacionService,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private barriosService: BarrioService,
    ) { }


    ngOnInit() {
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        this.organizacion$ = this.organizacionService.getById(this.auth.organizacion.id).pipe(
            cache()
        );
        this.paises$ = this.paisService.get({ nombre: 'Argentina' }).pipe(
            cache()
        );
        this.provincias$ = this.provinciaService.get({}).pipe(
            cache()
        );

        this.georeferencia$ = combineLatest(
            this.organizacion$,
            this.paises$,
            this.provincias$
        ).pipe(
            switchMap(([org, pais, provincias]) => {
                this.organizacionActual = org;
                this.paisArgentina = pais;
                this.provinciaActual = org.direccion.ubicacion.provincia;
                this.localidadActual = org.direccion.ubicacion.localidad;
                const prov = this.paciente.direccion[0].ubicacion.provincia || this.provinciaActual;
                let direccionCompleta = (this.organizacionActual.direccion.valor || '') + ', ' + (this.localidadActual.nombre || '') + ', ' + (this.provinciaActual.nombre || '');
                return this.georeferenciaService.getGeoreferencia({ direccion: direccionCompleta });
            }),
            map((point) => {
                if (this.organizacionActual.direccion.geoReferencia) {
                    return this.organizacionActual.direccion.geoReferencia;
                }
                return [point.lat, point.lng];
            }),
            cache());


        this.formChangesSubscription = this.ngForm.form.valueChanges
            .debounceTime(300)
            .subscribe(formValues => {
                this.changes.emit({ values: formValues, isValid: this.ngForm.valid });
            });
    }

    ngAfterViewInit() {
        // actualiza datos de ubicacion


        /*
                this.organizacionService.getById(this.auth.organizacion.id).subscribe((org: IOrganizacion) => {
                    if (org) {
                        this.organizacionActual = org;
                        this.provinciaActual = org.direccion.ubicacion.provincia;
                        this.localidadActual = org.direccion.ubicacion.localidad;
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
                        // this.loadPaciente();
                    }
                }); */
    }

    ngOnDestroy() {
        this.formChangesSubscription.unsubscribe();
    }

    loadPaciente() {
        if (this.paciente) {
            // actualiza contactos
            /*             if (!this.paciente.contacto || !this.paciente.contacto.length) {
                            this.paciente.contacto = [this.contacto];
                        } */
            // actualiza domicilio
            if (!this.paciente.direccion || !this.paciente.direccion.length) {
                this.paciente.direccion = [this.direccion];
            } else {
                if (this.paciente.direccion[0].ubicacion && this.organizacionActual) {
                    if (this.paciente.direccion[0].ubicacion.provincia) {
                        if (this.provinciaActual) {
                            (this.paciente.direccion[0].ubicacion.provincia.nombre === this.provinciaActual.nombre) ? this.viveProvActual = true : this.viveProvActual = false;
                        }
                        this.loadLocalidades(this.paciente.direccion[0].ubicacion.provincia);
                    }
                    if (this.paciente.direccion[0].ubicacion.localidad) {
                        if (this.localidadActual) {
                            (this.paciente.direccion[0].ubicacion.localidad.nombre === this.localidadActual.nombre) ? this.viveLocActual = true : (this.viveLocActual = false);
                        }
                        this.loadBarrios(this.paciente.direccion[0].ubicacion.localidad);
                    }
                }
            }
            if (!this.paciente.reportarError) {
                this.paciente.reportarError = false;
            }
            this.inicializarMapaDefault();
        } else {
            this.inicializarMapaDefault();
        }
    }


    // ------------------- CONTACTO -------------------

    addContacto(key, valor) {
        let indexUltimo = this.paciente.contacto.length - 1;

        if (this.paciente.contacto[indexUltimo].valor) {
            let nuevoContacto = Object.assign({}, {
                tipo: key,
                valor: valor,
                ranking: 0,
                activo: true,
                ultimaActualizacion: new Date()
            });

            this.paciente.contacto.push(nuevoContacto);
        } else {
            this.plex.toast('info', 'Debe completar los contactos anteriores.');
        }
    }

    removeContacto(i) {
        if (i >= 0) {
            this.paciente.contacto.splice(i, 1);
        }
    }

    // Guarda los contactos cuando se tilda "no posee contactos", para recuperarlos en caso de destildar el box.
    limpiarContacto() {
        if (this.noPoseeContacto) {
            this.contactosCache = this.paciente.contacto;
            this.paciente.contacto = [this.contacto];
        } else {
            this.paciente.contacto = this.contactosCache;
        }
    }

    verificarCorreoValido(indice, mail) {
        let formato = /^[a-zA-Z0-9_.+-]+\@[a-zA-Z0-9-]+(\.[a-z]{2,4})+$/;
        this.ngForm.form.controls['valor-' + indice].setErrors({});  // con cada caracter nuevo 'limpia' el error y reevalúa
        window.setTimeout(() => {
            if (mail) {
                if (formato.test(mail)) {
                    this.ngForm.form.controls['valor-0'].setErrors({});
                } else {
                    this.ngForm.form.controls['valor-0'].setErrors({ invalid: true, pattern: { requiredPattern: formato } });
                }
            }
        }, 500);
    }

    onFocusout(type, value) {
        let item = null;
        for (let elem of this.paciente.contacto) {
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

    // -------------------- DOMICILIO -------------------
    loadProvincia() {
        this.provincias$ = this.provinciaService.get({}).pipe(
            cache()
        );
    }

    loadLocalidades(provincia) {
        this.localidadRequerida = false;
        if (provincia && provincia.id) {
            this.viveProvActual = (provincia.id === this.provinciaActual.id);
            this.localidades$ = this.localidadService.getXProvincia(provincia.id).pipe(
                cache()
            );
            this.localidadRequerida = true;
        }
    }

    loadBarrios(localidad) {
        if (localidad && localidad.id) {
            if (localidad.id === this.localidadActual.id) {
                this.viveLocActual = true;
            }
            this.barrios$ = this.barriosService.getXLocalidad(localidad.id).pipe(
                cache()
            );
        }
    }

    /**
     * Cambia el estado del plex-bool viveProvActual
     * carga las localidades correspondientes a la provincia del actual
     * @param {any} event
     */
    changeProvActual(event) {
        this.viveProvActual = event.value;
        if (this.viveProvActual) {
            this.paciente.direccion[0].ubicacion.provincia = this.provinciaActual;
            this.loadLocalidades(this.provinciaActual);
        } else {
            this.changeLocalidadActual({ value: false });
            this.localidades = [];
            this.paciente.direccion[0].ubicacion.provincia = null;
            this.paciente.direccion[0].ubicacion.localidad = null;
            this.paciente.direccion[0].ubicacion.barrio = null;
        }
    }

    /**
     * Cambia el estado del plex-bool viveLocActual
     * carga los barrios de la provincia del actual
     * @param {any} event
     *
     * @memberOf PacienteCreateUpdateComponent
     */
    changeLocalidadActual(event) {
        this.viveLocActual = event.value;
        if (this.viveLocActual) {
            this.paciente.direccion[0].ubicacion.localidad = this.localidadActual;
            this.loadBarrios(this.localidadActual);
        } else {
            this.paciente.direccion[0].ubicacion.localidad = null;
            this.paciente.direccion[0].ubicacion.barrio = null;
        }
    }

    // ---------------------- MAPA -------------------

    checkDisableGeolocalizar(direccion: String) {
        if (direccion) {
            this.disableGeolocalizar = false;
        } else {
            this.disableGeolocalizar = true;
        }
    }

    changeCoordenadas(coordenadas) {
        this.geoReferenciaAux = coordenadas;    // Se actualiza vista del mapa
        this.paciente.direccion[0].geoReferencia = coordenadas;    // Se asigna nueva georeferencia al paciente
    }

    geoReferenciar() {
        // campos de direccion completos?
        if (this.paciente.direccion[0].valor && this.paciente.direccion[0].ubicacion.provincia && this.paciente.direccion[0].ubicacion.localidad) {
            let direccionCompleta = this.paciente.direccion[0].valor + ', ' + this.paciente.direccion[0].ubicacion.localidad.nombre
                + ', ' + this.paciente.direccion[0].ubicacion.provincia.nombre;
            // se calcula nueva georeferencia
            this.georeferenciaService.getGeoreferencia({ direccion: direccionCompleta }).subscribe(point => {
                if (point && Object.keys(point).length) {
                    this.geoReferenciaAux = [point.lat, point.lng]; // se actualiza vista de mapa
                    this.paciente.direccion[0].geoReferencia = [point.lat, point.lng]; // Se asigna nueva georeferencia al paciente
                    this.infoMarcador = '';
                } else {
                    this.plex.toast('warning', 'Dirección no encontrada. Señale manualmente en el mapa.');
                }
            });
        } else {
            this.plex.toast('info', 'Debe completar datos del domicilio.');
        }
    }

    inicializarMapaDefault() {
        // ubicacion inicial mapa de google
        if (this.paciente.direccion[0].geoReferencia) {
            this.geoReferenciaAux = this.paciente.direccion[0].geoReferencia;
            this.infoMarcador = null;
        } else {
            if (this.organizacionActual) {
                if (this.organizacionActual.direccion.geoReferencia) {
                    this.geoReferenciaAux = this.organizacionActual.direccion.geoReferencia;
                } else {
                    let direccionCompleta = this.organizacionActual.direccion.valor + ', ' + this.localidadActual.nombre + ', ' + this.provinciaActual.nombre;
                    this.georeferenciaService.getGeoreferencia({ direccion: direccionCompleta }).subscribe(point => {
                        if (point && Object.keys(point).length) {
                            this.geoReferenciaAux = [point.lat, point.lng];
                        }
                    });
                }
            }
        }
    }
}
