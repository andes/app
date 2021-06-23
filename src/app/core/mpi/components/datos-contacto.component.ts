import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { IContacto } from '../../../interfaces/IContacto';
import { IProvincia } from '../../../interfaces/IProvincia';
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
import { Subscription, Observable, combineLatest } from 'rxjs';
import { NgForm } from '@angular/forms';
import { cache } from '@andes/shared';
import { switchMap, map } from 'rxjs/operators';
import { GeorrefMapComponent } from './georref-map.component';
import { AppMobileService } from '../../../services/appMobile.service';
import { PacienteService } from '../services/paciente.service';
import { IPais } from 'src/app/interfaces/IPais';

@Component({
    selector: 'datos-contacto',
    templateUrl: 'datos-contacto.html',
    styleUrls: ['datos-contacto.scss']
})

export class DatosContactoComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Output() mobileApp: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('form', { static: false }) ngForm: NgForm;
    @ViewChild('mapa', { static: false }) mapa: GeorrefMapComponent;

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
    public localidadesNacimiento$: Observable<ILocalidad[]>;
    public paisesNacimiento$: Observable<IPais[]>;
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
    localidades: ILocalidad[] = [];
    paisActual = null;
    provinciaActual = null;
    localidadActual = null;
    organizacionActual = null;

    // Lugar nacimiento
    nacioLocActual = false;
    nacioProvActual = false;
    nacioPaisActual = false;

    patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;
    patronContactoAlfabetico = /^[-\w.%+]{1,61}@[a-z]+(.[a-z]+)+$/;


    constructor(
        private auth: Auth,
        private plex: Plex,
        private pacienteService: PacienteService,
        private georeferenciaService: GeoreferenciaService,
        private organizacionService: OrganizacionService,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private barriosService: BarrioService,
        private appMobile: AppMobileService
    ) { }


    ngOnInit() {
        this.loadPaisesNacimiento();
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

        this.georeferencia$ = combineLatest([
            this.organizacion$,
            this.paises$,
            this.provincias$
        ]).pipe(
            switchMap(([org, pais, provincias]) => {
                this.organizacionActual = org;
                this.paisActual = pais;
                this.provinciaActual = org.direccion.ubicacion.provincia;
                this.localidadActual = org.direccion.ubicacion.localidad;
                const ubicacion = this.paciente.direccion[0].ubicacion;
                this.viveProvActual = ubicacion.provincia && ubicacion.provincia.id === this.provinciaActual.id;
                this.viveLocActual = ubicacion.localidad && ubicacion.localidad.id === this.localidadActual.id;

                const lugarNac = this.paciente.lugarNacimiento;
                this.nacioPaisActual = lugarNac.pais?.id === this.paisActual[0].id;
                this.nacioProvActual = lugarNac.provincia?.id === this.provinciaActual.id;
                this.nacioLocActual = lugarNac.localidad?.id === this.localidadActual.id;

                let direccionCompleta;

                if (this.paciente.direccion[0].valor && this.paciente.direccion[0].ubicacion.provincia && this.paciente.direccion[0].ubicacion.localidad) {
                    direccionCompleta = this.paciente.direccion[0].valor + ', ' + this.paciente.direccion[0].ubicacion.localidad.nombre
                        + ', ' + this.paciente.direccion[0].ubicacion.provincia.nombre;
                } else {
                    direccionCompleta = (this.organizacionActual.direccion.valor || '') + ', ' + (this.localidadActual.nombre || '') + ', ' + (this.provinciaActual.nombre || '');
                }
                return this.georeferenciaService.getGeoreferencia({ direccion: direccionCompleta });
            }),
            map(point => {
                if (this.paciente.direccion[0].geoReferencia) {
                    return this.paciente.direccion[0].geoReferencia;
                }
                if (this.organizacionActual.direccion.geoReferencia) {
                    return this.organizacionActual.direccion.geoReferencia;
                }
                return [point.lat, point.lng];
            }),
            cache());
    }

    contactoTelefonico(index) {
        let tipoContacto = this.paciente.contacto[index].tipo;
        return tipoContacto === 'fijo' || tipoContacto?.id === 'fijo' || tipoContacto === 'celular' || tipoContacto?.id === 'celular';
    }

    public checkForm() {
        this.ngForm.control.markAllAsTouched();
        return this.ngForm.control.valid;
    }

    public refreshVars() {
        const ubicacion = this.paciente.direccion[0].ubicacion;
        this.viveProvActual = (ubicacion.provincia && ubicacion.provincia.id === this.provinciaActual.id) ? true : false;
        this.viveLocActual = (ubicacion.localidad && ubicacion.localidad.id === this.localidadActual.id ? true : false);
        if (!this.disableGeoreferenciar) {
            this.geoReferenciar();
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

    // notificación para activar cuenta al guardar
    mobileNotify(data) {
        this.mobileApp.emit(data);
    }


    activarAppMobile(unPaciente: IPaciente, cuenta: any) {
        // Activa la app mobile
        if (cuenta.email && cuenta.celular) {
            let poseeMail = unPaciente.contacto.find((c: any) => c.tipo === 'email' && c.valor === cuenta.email);
            if (!poseeMail) {
                // Se agrega nuevo contacto al paciente
                let nuevo = {
                    tipo: 'email',
                    valor: cuenta.email,
                    ranking: 1,
                    activo: true,
                    ultimaActualizacion: new Date()
                };
                unPaciente.contacto.push(nuevo);
                let cambios = {
                    op: 'updateContactos',
                    contacto: unPaciente.contacto
                };
                this.pacienteService.patch(unPaciente.id, cambios).subscribe(resultado => {
                    if (resultado) {
                        this.plex.toast('info', 'Datos del paciente actualizados');
                    }
                });
            }
            this.appMobile.create(unPaciente.id, {
                email: cuenta.email,
                telefono: cuenta.celular
            }).subscribe((datos) => {
                if (datos.error) {
                    if (datos.error === 'email_not_found') {
                        this.plex.info('El paciente no tiene asignado un email.', 'Atención');
                    }
                    if (datos.error === 'email_exists') {
                        this.plex.info('El activando app-mobile con un mail existente', 'Atención');
                    }
                } else {
                    this.plex.toast('success', 'Se ha enviado el código de activación mobile al paciente');
                }
            });
        }
    }

    // -------------------- DOMICILIO -------------------

    get direccionLegal() {
        let dir = null;
        if (this.paciente.direccion[1] && this.paciente.direccion[1].valor) {
            dir = this.paciente.direccion[1];
            const localidad = dir.ubicacion && dir.ubicacion.localidad && dir.ubicacion.localidad.nombre ? `, ${dir.ubicacion.localidad.nombre}` : '';
            const provincia = dir.ubicacion && dir.ubicacion.provincia && dir.ubicacion.provincia.nombre ? `, ${dir.ubicacion.provincia.nombre}` : '';
            dir = `${dir.valor} ${localidad} ${provincia}`;
        }
        return dir;
    }

    loadProvincia() {
        this.provincias$ = this.provinciaService.get({}).pipe(
            cache()
        );
    }

    loadLocalidades(provincia) {
        if (provincia && provincia.id) {
            this.viveProvActual = (provincia.id === this.provinciaActual.id);
            this.localidades$ = this.localidadService.getXProvincia(provincia.id).pipe(
                cache()
            );
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

    // -------------------- LUGAR NACIMIENTO -------------------

    loadPaisesNacimiento() {
        this.paisesNacimiento$ = this.paisService.get({}).pipe(
            cache()
        );
    }

    loadLocalidadesNacimiento(provincia) {
        this.paciente.lugarNacimiento.localidad = null;
        if (provincia && provincia.id) {
            this.nacioProvActual = (provincia.id === this.provinciaActual.id);
            this.localidadesNacimiento$ = this.localidadService.getXProvincia(provincia.id).pipe(
                cache()
            );
        } else {
            this.localidadesNacimiento$ = null;
            this.nacioLocActual = false;
            this.paciente.lugarNacimiento.provincia = null;
            this.paciente.lugarNacimiento.localidad = null;
        }
    }

    updateNacioLocalidadActual() {
        const localidad = this.paciente.lugarNacimiento.localidad;
        this.paciente.lugarNacimiento.lugar = null;
        if (localidad && localidad.id) {
            this.nacioLocActual = (localidad.id === this.localidadActual.id);
        }
    }

    /**
     * carga las localidades correspondientes a la provincia del actual
     * @param {any} event
     */
    changeProvActual() {
        if (this.viveProvActual) {
            this.paciente.direccion[0].ubicacion.provincia = this.provinciaActual;
            this.loadLocalidades(this.provinciaActual);
        } else {
            this.loadProvincia();
            this.viveLocActual = false;
            this.localidades$ = null;
            this.paciente.direccion[0].ubicacion.provincia = null;
            this.paciente.direccion[0].ubicacion.localidad = null;
            this.paciente.direccion[0].ubicacion.barrio = null;
        }
    }

    /**
     * carga los barrios de la provincia del actual
     * @param {any} event
     *
     * @memberOf PacienteCreateUpdateComponent
     */
    changeLocalidadActual() {
        if (this.viveLocActual) {
            this.paciente.direccion[0].ubicacion.localidad = this.localidadActual;
            this.loadBarrios(this.localidadActual);
        } else {
            this.paciente.direccion[0].ubicacion.localidad = null;
            this.paciente.direccion[0].ubicacion.barrio = null;
            this.loadLocalidades(this.paciente.direccion[0].ubicacion.provincia);
        }
    }

    /**
       * setea datos de acuerdo al pais de nacimiento elegido
       * @param {any} event
       */
    loadPaisActualNacimiento() {
        const pais = this.paciente.lugarNacimiento.pais;
        if (pais && pais.id) {
            this.nacioPaisActual = (pais.id === this.paisActual[0].id);
            if (this.nacioPaisActual) {
                this.paciente.lugarNacimiento.lugar = null;
            }
        }
        this.paciente.lugarNacimiento.provincia = null;
        this.paciente.lugarNacimiento.localidad = null;
        this.localidades$ = null;
    }

    /**
     * carga las provincias si nació en Argentina
     * caso contrario se limpian los datos y se carga texto libre
     */
    changePaisActualNacimiento() {
        if (this.nacioPaisActual) {
            this.loadProvincia();
            this.paciente.lugarNacimiento.pais = this.paisActual[0];
            this.paciente.lugarNacimiento.lugar = null;
        } else {
            this.paciente.lugarNacimiento.pais = null;
            this.paciente.lugarNacimiento.provincia = null;
            this.paciente.lugarNacimiento.localidad = null;
        }
        this.localidades$ = null;
        this.nacioLocActual = false;
        this.nacioProvActual = false;
    }

    /**
     * carga las localidades correspondientes a la provincia de nacimiento
     * @param {any} event
     */
    changeProvActualNacimiento() {
        if (this.nacioProvActual) {
            this.paciente.lugarNacimiento.provincia = this.provinciaActual;
            this.loadLocalidadesNacimiento(this.provinciaActual);
        } else {
            this.loadProvincia();
            this.nacioLocActual = false;
            this.localidades$ = null;
            this.paciente.lugarNacimiento.provincia = null;
            this.paciente.lugarNacimiento.localidad = null;
        }
    }

    /**
     * carga las localidades según la provincia de nacimiento
     * @param {any} event
     *
     * @memberOf PacienteCreateUpdateComponent
     */
    changeLocalidadActualNacimiento() {
        if (this.nacioLocActual) {
            this.paciente.lugarNacimiento.localidad = this.localidadActual;
        } else {
            this.paciente.lugarNacimiento.localidad = null;
            this.paciente.lugarNacimiento.lugar = null;
            this.loadLocalidadesNacimiento(this.paciente.lugarNacimiento.provincia);
        }
    }

    // ------------------------ MAPA ------------------------

    get disableGeoreferenciar() {
        return !(this.paciente.direccion[0].valor && this.paciente.direccion[0].ubicacion.provincia && this.paciente.direccion[0].ubicacion.localidad);
    }

    refreshMap() {
        this.mapa.refresh();
    }

    changeCoordenadas(coordenadas) {
        this.paciente.direccion[0].geoReferencia = coordenadas;
    }

    geoReferenciar() {
        let direccionCompleta = this.paciente.direccion[0].valor + ', ' + this.paciente.direccion[0].ubicacion.localidad.nombre
            + ', ' + this.paciente.direccion[0].ubicacion.provincia.nombre;
        // se calcula nueva georeferencia
        this.georeferencia$ = this.georeferenciaService.getGeoreferencia({ direccion: direccionCompleta })
            .pipe(
                map(point => {
                    if (point && Object.keys(point).length) {
                        this.paciente.direccion[0].geoReferencia = [point.lat, point.lng]; // Se asigna nueva georeferencia al paciente
                        return [point.lat, point.lng];
                    } else {
                        this.plex.toast('warning', 'Dirección no encontrada. Señale manualmente en el mapa.');
                    }
                    return this.georeferencia$;
                }),
                cache());
    }
}
