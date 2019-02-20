import { Constantes } from './../../controllers/constants';
import { Component, OnInit, Input, ViewChild, EventEmitter, Output, ViewEncapsulation, HostBinding } from '@angular/core';
import { ProtocoloDetalleComponent } from '../protocolos/protocolo-detalle.component';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PacienteService } from '../../../../../services/paciente.service';
import { ActivatedRoute } from '@angular/router';
import { LaboratorioContextoCacheService } from '../../services/protocoloCache.service';
import { ProtocoloService } from '../../services/protocolo.service';


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
    public showBotonGuardar: Boolean = false;
    public editarListaPracticas: Boolean = false;
    public showBotonAceptarCambiosAuditoria: Boolean = false;
    public showBotonAceptarCambiosHeader: Boolean = false;

    public titulo;
    public contextoCache;

    public areas = [];

    public protocolos: any[];
    public protocolo: any;
    routeParams: any;

    @Input('protocolo')
    set setProtocolo(value: any) {
        if (value) {
            this.seleccionarProtocolo({ protocolo: value, index: 0 });
        }
    }

    @Input('turno')
    set turno(turno: any) {
        if (turno) {
            this.resetearProtocolo(null, turno);

        }
    }

    // @Input() modo: 'puntoInicio' | 'listado' | 'recepcion' | 'control' | 'carga' | 'validacion';
    modoAVolver: 'puntoInicio' | 'listado' | 'recepcion' | 'control' | 'carga' | 'validacion';

    @Input('paciente')
    set paciente(value) {
        if (value) {
            this.resetearProtocolo(value);
            this.seleccionarProtocolo({ protocolo: this.protocolo, index: 0 });
            this.editarListaPracticas = true;
            this.showProtocoloDetalle = true;
            this.indexProtocolo = 0;
            this.seleccionPaciente = false;
            this.laboratorioContextoCacheService.setPaciente();
        }
    }

    public indexProtocolo;
    public busqueda;

    public accionIndex;

    @ViewChild(ProtocoloDetalleComponent)
    public protocoloDetalleComponent: ProtocoloDetalleComponent;

    constructor(
        public servicePaciente: PacienteService,
        private route: ActivatedRoute,
        public plex: Plex,
        public protocoloService: ProtocoloService,
        public auth: Auth,
        public laboratorioContextoCacheService: LaboratorioContextoCacheService,
    ) { }

    ngOnInit() {
        this.contextoCache = this.laboratorioContextoCacheService.getContextoCache();
        if (!this.contextoCache.modo) {
            this.contextoCache.modo = Constantes.modos.carga;
        }

        this.accionIndex = this.contextoCache.modo ? this.contextoCache.modo.id : 3;

        if (!this.protocolo) {
            this.resetearProtocolo({});
        }
        console.log(this.route.snapshot.routeConfig );
        if (this.route.snapshot.routeConfig.path === 'laboratorio/protocolos/turno') {
            this.resetearProtocolo(null, this.contextoCache.turno);
            this.mostrarFomularioPacienteSinTurno();
            this.seleccionPaciente = false;
            this.seleccionarProtocolo(this.protocolo);
            this.laboratorioContextoCacheService.ventanillaSinTurno();
            this.showProtocoloDetalle = true;
            this.showListarProtocolos = false;
        } else {
            this.routeParams = this.route.params.subscribe(params => {
                if (params['id']) {
                    let id = params['id'];
                    this.servicePaciente.getById(id).subscribe(pacienteMPI => {
                        this.paciente = pacienteMPI;
                        this.mostrarFomularioPacienteSinTurno();
                        this.seleccionPaciente = false;
                        this.seleccionarProtocolo(this.protocolo);
                        this.laboratorioContextoCacheService.ventanillaSinTurno();
                    });
                }
            });
        }

    }

    /**
     *
     *
     * @param {*} $event
     * @memberof GestorProtocolosComponent
     */
    onTabChange($event) {
        this.laboratorioContextoCacheService.cambiarModo($event);
        this.refreshSelection(this.busqueda);
    }

    /**
     * resetearProtocolo resetea el atributo protoloco con un esquema de prestación vacio
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    resetearProtocolo(paciente?, turno?) {
        this.protocolo = {
            paciente: turno ? turno.paciente : paciente,
            solicitud: {
                esSolicitud: true,
                tipoPrestacion: turno ? turno.tipoPrestacion : Constantes.conceptoPruebaLaboratorio,
                organizacion: turno ? turno.organizacion : this.auth.organizacion,
                profesional: turno ? turno.updatedBy : {},
                ambitoOrigen: null,
                fecha: turno ? turno.horaInicio : new Date(),
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
    }

    /**
     * Realiza la búsqueda de prestaciones según selección de filtros
     *
     * @param {any} [value]
     * @param {any} [tipo]
     * @memberof PuntoInicioLaboratorioComponent
     */
    refreshSelection(filtros) {
        if (!filtros) {
            this.protocolos.length = 0;
            return;
        }
        // if ($event) {
        this.busqueda = filtros;
        this.areas = filtros.areas ? filtros.areas : [];
        // }

        this.busqueda.estado = this.laboratorioContextoCacheService.isModoValidacion() ? ['pendiente', 'ejecucion'] :  [];

        this.protocoloService.get(this.busqueda).subscribe(protocolos => {
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
            this.laboratorioContextoCacheService.seleccionarProtocolo();
            this.editarListaPracticas = (!this.laboratorioContextoCacheService.isModoRecepcion());
            this.protocolo = value.protocolo;
            this.indexProtocolo = value.index;
            this.showListarProtocolos = false;
            this.showProtocoloDetalle = true;
            this.seleccionPaciente = false;
            this.showCargarSolicitud = true;
            // this.showBotonAceptar = false;
            this.showBotonGuardar = true;
        }
    }

    /**
     * volverLista oculta panel de detalle de protolo y muestra en su lugar panel de lista de protocolos
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    volver() {
        if (this.laboratorioContextoCacheService.isModoRecepcionSinTurno()) {
            // location.reload();
            this.volverAPuntoInicioEmmiter.emit(true);
        } else if (this.contextoCache.edicionDatosCabecera) {
            this.aceptarCambiosHeader();
        } else {
            this.refreshSelection(this.busqueda);
            this.showListarProtocolos = true;
            this.showProtocoloDetalle = false;
            this.showCargarSolicitud = false;
            this.contextoCache.ocultarPanelLateral = false;
            this.seleccionPaciente = false;
        }
    }

    /**
     *
     *
     * @memberof GestorProtocolosComponent
     */
    editarDatosCabecera() {
        this.showBotonAceptarCambiosAuditoria = false;
        this.showBotonAceptarCambiosHeader = true;
        this.showBotonGuardar = false;
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
            this.showListarProtocolos = false;
            this.showProtocoloDetalle = true;
            this.indexProtocolo = 0;
            this.seleccionPaciente = true;
            // this.showBotonAceptar = true;

            this.contextoCache.mostrarCuerpoProtocolo = true;
            this.contextoCache.edicionDatosCabecera = true;
        }
    }

    /**
     *
     *
     * @memberof GestorProtocolosComponent
     */
    aceptarCambiosAuditoria() {
        this.showBotonAceptarCambiosAuditoria = false;
        this.showBotonGuardar = true;

        if (this.contextoCache.modoAVolver) {
            this.laboratorioContextoCacheService.aceptarCambiosAuditoriaProtocolo();
            this.protocoloDetalleComponent.guardarSolicitudYVolver();
        }
    }

    /**
     *
     *
     * @memberof GestorProtocolosComponent
     */
    aceptarCambiosHeader() {
        this.showBotonAceptarCambiosHeader = false;
        this.showBotonGuardar = true;
        this.protocoloDetalleComponent.aceptarEdicionCabecera();
    }

    /**
     *
     *
     * @memberof GestorProtocolosComponent
     */
    volverAControl() {
        this.laboratorioContextoCacheService.irAuditoriaProtocolo();
        this.laboratorioContextoCacheService.modoControl();
        this.showBotonAceptarCambiosAuditoria = true;
        this.showBotonGuardar = false;
    }

    /**
     *
     *
     * @memberof GestorProtocolosComponent
     */
    guardarSolicitud() {
        this.protocoloDetalleComponent.guardarSolicitud();
    }

    /**
     *
     *
     * @memberof GestorProtocolosComponent
     */
    salirDeHistoricoResultados() {
        this.laboratorioContextoCacheService.salirDeHistoricoResultados();
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

    //     if (this.contextoCache.modo === 'Recepcion') {
    //         this.turnosLaboratorio();
    //     }
    // }
}



