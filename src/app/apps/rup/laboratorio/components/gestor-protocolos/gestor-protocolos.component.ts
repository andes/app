import { Constantes } from './../../controllers/constants';
import { Component, OnInit, Input, ViewChild, EventEmitter, Output, ViewEncapsulation, HostBinding, OnDestroy } from '@angular/core';
import { ProtocoloDetalleComponent } from '../protocolos/protocolo-detalle.component';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';

import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PacienteService } from '../../../../../services/paciente.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'gestor-protocolos',
    templateUrl: 'gestor-protocolos.html',
    styleUrls: ['../../assets/laboratorio.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class GestorProtocolosComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    @Output() volverAPuntoInicioEmmiter: EventEmitter<any> = new EventEmitter<any>();
    public seleccionPaciente: Boolean = false;
    public showListarProtocolos: Boolean = true;
    public showProtocoloDetalle: Boolean = false;
    public showCargarSolicitud: Boolean = false;
    public edicionDatosCabecera: Boolean;
    public showBotonGuardar: Boolean = false;
    public mostrarCuerpoProtocolo: Boolean = true;
    public ocultarPanelLateral: Boolean = false;
    public editarListaPracticas: Boolean = false;
    public showBotonAceptar: Boolean = false;

    public areas = [];

    public protocolos: any[];
    public protocolo: any;
    routeParams: any;

    @Input('protocolo')
    set setProtocolo(value: any) {
        if (value) {
            this.seleccionarProtocolo({ protocolo: value, index: 0 });
            this.ocultarPanelLateral = true;
        }
    }
    @Input() modo;

    @Input('paciente')
    set paciente(value) {
        if (value) {
            this.resetearProtocolo(value);
            this.seleccionarProtocolo({ protocolo: this.protocolo, index: 0 });
            this.editarListaPracticas = true;
            this.edicionDatosCabecera = true;
            this.ocultarPanelLateral = true;
            this.showProtocoloDetalle = true;
            this.indexProtocolo = 0;
            this.seleccionPaciente = false;
            this.mostrarCuerpoProtocolo = true;
        }
    }

    public indexProtocolo;
    public busqueda;

    public accionIndex = 1;
    public modoAVolver = '';

    @ViewChild(ProtocoloDetalleComponent)
    public protocoloDetalleComponent: ProtocoloDetalleComponent;

    constructor(
        public servicePaciente: PacienteService,
        private route: ActivatedRoute,
        public plex: Plex,
        public servicioPrestaciones: PrestacionesService,
        public auth: Auth,
        // public as: AgendaCacheService
    ) { }

    ngOnInit() {
        if (!this.protocolo) {
            this.resetearProtocolo({});
        }
        this.showBotonAceptar = true;
        this.routeParams = this.route.params.subscribe(params => {
            console.log(params);
            if (params['id']) {
                let id = params['id'];
                this.servicePaciente.getById(id).subscribe(pacienteMPI => {
                    this.modo = 'recepcion';
                    this.paciente = pacienteMPI;
                    this.ocultarPanelLateral = false;
                    this.mostrarFomularioPacienteSinTurno();
                    this.seleccionPaciente = false;
                    this.seleccionarProtocolo(this.protocolo);
                    // this.resetearProtocolo(this.paciente);
                    // this.editarListaPracticas = true;
                    // this.edicionDatosCabecera = true;
                    // this.ocultarPanelLateral = true;
                    // this.showProtocoloDetalle = true;
                    // this.indexProtocolo = 0;
                    // this.seleccionPaciente = false;
                    // this.mostrarCuerpoProtocolo = true;
                });
            }

        });
    }

    // ngOnDestroy() {
    //     this.routeParams.unsubscribe();
    // }

    cambio($event) {
        this.accionIndex = $event;
        if ($event === 0) {
            this.modo = 'recepcion';
        } else if ($event === 1) {
            this.modo = 'control';
        } else if ($event === 2) {
            this.modo = 'carga';
        } else if ($event === 3) {
            this.modo = 'validacion';
        } else if ($event === 4) {
            this.modo = 'listado';
        }
        this.refreshSelection();
    }

    /**
     * resetearProtocolo resetea el atributo protoloco con un esquema de prestación vacio
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    resetearProtocolo(paciente) {
        this.protocolo = {
            paciente: paciente,
            solicitud: {
                esSolicitud: true,
                tipoPrestacion: null,
                organizacion: this.auth.organizacion,
                profesional: {},
                ambitoOrigen: null,
                fecha: new Date(),
                registros: [{
                    nombre: 'Prueba de Laboratorio',
                    concepto: Constantes.conceptoPruebaLaboratorio,
                    valor: {
                        solicitudPrestacion: {
                            practicas: [],
                            fechaTomaMuestra: new Date()
                        }
                    }
                }]
            },
            ejecucion: {
                fecha: new Date(),
                registros: []
            }
        };
        // this.protocolo = IPrestacion.constructor();
    }

    /**
     * Realiza la búsqueda de prestaciones según selección de filtros
     *
     * @param {any} [value]
     * @param {any} [tipo]
     * @memberof PuntoInicioLaboratorioComponent
     */
    refreshSelection($event?) {
        if ($event) {
            this.busqueda = $event;
            this.areas = $event.areas ? $event.areas : [];
        }

        this.getProtocolos(this.busqueda);
    }

    getProtocolos(params: any) {
        this.servicioPrestaciones.get(params).subscribe(protocolos => {
            this.protocolos = protocolos;
        }, err => {
            if (err) {
                this.plex.info('danger', err);
            }
        });
    }

    /**
     * seleccionarProtocolo oculta lista de protocolos y muestra el panel de detalle de protocolo, al ser cliqueado un protocolo de la lista
     *
     * @param {any} protocolo
     * @param {any} index
     * @memberof PuntoInicioLaboratorioComponent
     */
    seleccionarProtocolo(value) {
        // Si se presionó el boton suspender, no se muestran otros protocolos hasta que se confirme o cancele la acción.
        if (value.protocolo) {
            this.mostrarCuerpoProtocolo = (this.modo === 'control') || (this.modo === 'carga') || (this.modo === 'validacion') || (this.modo === 'puntoInicio');
            this.protocolo = value.protocolo;
            this.indexProtocolo = value.index;
            this.showListarProtocolos = false;
            this.showProtocoloDetalle = true;
            this.seleccionPaciente = false;
            this.showCargarSolicitud = true;
            this.showBotonAceptar = false;
            this.showBotonGuardar = true;
            this.ocultarPanelLateral = (this.modo === 'recepcion') || (this.modo === 'puntoInicio');
        }
    }

    /**
     * volverLista oculta panel de detalle de protolo y muestra en su lugar panel de lista de protocolos
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    volverLista() {
        if (this.modo === 'puntoInicio') {
            // location.reload();
            this.volverAPuntoInicioEmmiter.emit(true);
        } else {
            this.refreshSelection();
            this.showListarProtocolos = true;
            this.showProtocoloDetalle = false;
            this.showCargarSolicitud = false;
            this.ocultarPanelLateral = false;
            this.seleccionPaciente = false;
        }
    }

    /**
     * Cambia configuración de paneles para modo recepción paciente sin turno
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    mostrarFomularioPacienteSinTurno() {
        if (this.paciente) {
            this.resetearProtocolo(this.paciente);
            this.seleccionarProtocolo({});
            this.edicionDatosCabecera = true;
            // this.ocultarPanelLateral = true;
            this.showListarProtocolos = false;
            this.showProtocoloDetalle = true;
            this.indexProtocolo = 0;
            this.seleccionPaciente = true;
            this.mostrarCuerpoProtocolo = true;
            this.showBotonAceptar = true;
        }

        // this.mostrarCuerpoProtocolo = (this.modo === 'control') || (this.modo === 'carga') || (this.modo === 'validacion') || (this.modo === 'puntoInicio');
        //     this.showListarProtocolos = false;
        //     this.showProtocoloDetalle = true;
        //     this.seleccionPaciente = false;
        //     this.showCargarSolicitud = true;
        //     this.ocultarPanelLateral = (this.modo === 'recepcion') || (this.modo === 'puntoInicio');
        //     this.showBotonesGuardar = (this.modo !== 'recepcion');
    }

    // mostrarBotonesGuardarProtocoloFooter($event) {
    //     this.showBotonesGuardar = $event;
    // }

    /**
     *
     *
     * @memberof GestorProtocolosComponent
     */
    aceptarCambios() {
        if (this.modoAVolver !== '') {
            // this.showProtocoloDetalle = true;
            // this.modo = this.modoAVolver;
            // this.modoAVolver = '';
            // this.ocultarPanelLateral = false;
            // this.showBotonAceptar = true;
            // this.showListarProtocolos = false;
            // guardarSolicitudYVolver() {
        this.ocultarPanelLateral = false;
        this.modo = this.modoAVolver;
        this.protocoloDetalleComponent.guardarSolicitudYVolver(this.modoAVolver);
        this.modoAVolver = '';
    // }
        } else {
            this.showBotonAceptar = false;
            this.showBotonGuardar = true;
            this.protocoloDetalleComponent.aceptarEdicionCabecera();
        }
    }


    /**
     * Guarda en el local storage del browser la selección de filtros de búsqueda para futuras búsquedas
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    recordarFiltros() {
        let filtrosPorDefecto = {
            busqueda: this.busqueda,
            profesional: this.auth.profesional._id
        };

        //     let filtros = JSON.parse(localStorage.getItem('filtros'));
        //     console.log(filtros);
        //     if (!filtros) {
        //         filtros = [filtrosPorDefecto];
        //     } else {
        //         let existe = filtros.findIndex(x => x.profesional === filtrosPorDefecto.profesional);
        //         console.log(existe);
        //         if (existe === -1) {
        //             filtros.push(filtrosPorDefecto);
        //         }
        //     }

        localStorage.setItem('filtros', JSON.stringify(filtrosPorDefecto));
        this.plex.toast('success', 'Se recordará su selección de filtro en sus próximas sesiones.', 'Información', 3000);
    }

    volverAControl() {
        this.protocoloDetalleComponent.cargarCodigosPracticas();
        this.ocultarPanelLateral = true;
        this.modoAVolver = this.modo;
        this.modo = 'control';
        this.showBotonAceptar = true;
        this.showBotonGuardar = false;
    }

    guardarSolicitud() {
        this.protocoloDetalleComponent.guardarSolicitud();
    }


    // getlocalStorage() {
    //     let ls = JSON.parse(localStorage.getItem('filtros'));

    //     console.log('ls profesional', ls.profesional);

    //     console.log('ls profesional', this.auth.profesional._id);
    //     if (ls.profesional === this.auth.profesional._id) {
    //         this.busqueda = ls.busqueda;
    //         // this.origen.id = ls.busqueda.origen;
    //         // this.area.id = ls.busqueda.;
    //         // this.prioridad.id = ls.busqueda.prioridad;
    //         console.log('local storage', this.busqueda);
    //         // this.busqueda.solicitudDesde = new Date(ls.busqueda.solicitudDesde);
    //     }

    //     if (this.modo === 'Recepcion') {
    //         this.turnosLaboratorio();
    //     }
    // }
}



