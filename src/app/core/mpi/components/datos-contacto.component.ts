import { Component, Input, OnInit } from '@angular/core';
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
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import * as enumerados from '../../../utils/enumerados';
import { Subscription } from 'rxjs';

@Component({
    selector: 'datos-contacto',
    templateUrl: 'datos-contacto.html',
    styleUrls: []
})

export class DatosContactoComponent implements OnInit {

    @Input('paciente')
    set paciente(value: IPaciente) {
        if (value) {
            this._paciente = value;
            this.refreshData();
        }
    }
    get paciente() {
        return this._paciente;
    }
    _paciente: IPaciente;
    // @Input() paciente: IPaciente;
    @Input() formulario;

    _form;
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
    barrios: IBarrio[] = [];
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

    // _paciente: IPaciente; = {
    //     id: null,
    //     documento: '',
    //     cuil: null,
    //     activo: true,
    //     estado: 'temporal',
    //     nombre: '',
    //     apellido: '',
    //     nombreCompleto: '',
    //     alias: '',
    //     contacto: [this.contacto],
    //     sexo: undefined,
    //     genero: undefined,
    //     fechaNacimiento: null, // Fecha Nacimiento
    //     tipoIdentificacion: '',
    //     numeroIdentificacion: '',
    //     edad: null,
    //     edadReal: null,
    //     fechaFallecimiento: null,
    //     direccion: [this.direccion],
    //     estadoCivil: undefined,
    //     foto: null,
    //     relaciones: null,
    //     financiador: null,
    //     identificadores: null,
    //     claveBlocking: null,
    //     scan: null,
    //     reportarError: false,
    //     notaError: ''
    // };

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
        // actualiza datos de ubicacion
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
                // this.inicializarMapaDefault();
            }
        });
    }

    refreshData() {
        if (this.paciente) {
            // actualiza contactos
            if (!this.paciente.contacto || !this.paciente.contacto.length) {
                this.paciente.contacto = [this.contacto];
            }
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
                            (this.paciente.direccion[0].ubicacion.localidad.nombre === this.localidadActual.nombre) ? this.viveLocActual = true : (this.viveLocActual = false, this.barrios = null);
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
        // this.formulario.form.controls['valor-' + indice].setErrors(null);  // con cada caracter nuevo 'limpia' el error y reevalúa
        // window.setTimeout(() => {
        //     if (mail) {
        //         if (formato.test(mail)) {
        //             this.formulario.form.controls['valor-' + indice].setErrors(null);
        //         } else {
        //             this.formulario.form.controls['valor-' + indice].setErrors({ invalid: true, pattern: { requiredPattern: formato } });
        //         }
        //     }
        // }, 500);
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

    loadProvincias(event, pais) {
        if (pais && pais.id) {
            this.provinciaService.get({
                pais: pais.id
            }).subscribe(event.callback);
        }
    }

    loadLocalidades(provincia) {
        this.localidadRequerida = false;
        if (provincia && provincia.id) {
            if (provincia.id === this.provinciaActual.id) {
                this.viveProvActual = true;
            }
            this.localidadService.getXProvincia(provincia.id).subscribe(result => {
                this.localidades = result;
                if (this.localidades && this.localidades.length) {
                    this.localidadRequerida = true;
                }
            });
        }
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

    /**
     * Cambia el estado del plex-bool viveProvActual
     * carga las localidades correspondientes a la provincia del actual
     * @param {any} event
     */
    changeProvActual(event) {
        if (event.value) {
            this.paciente.direccion[0].ubicacion.provincia = this.provinciaActual;
            this.loadLocalidades(this.provinciaActual);
        } else {
            this.viveLocActual = false;
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
        if (event.value) {
            this.paciente.direccion[0].ubicacion.localidad = this.localidadActual;
            this.loadBarrios(this.localidadActual);
        } else {
            this.paciente.direccion[0].ubicacion.localidad = null;
            this.paciente.direccion[0].ubicacion.barrio = null;
            this.barrios = [];
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
