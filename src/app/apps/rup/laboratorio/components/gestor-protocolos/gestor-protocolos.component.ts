import { Constantes } from './../../controllers/constants';
import { Component, OnInit, Input, ViewChild, EventEmitter, Output, ViewEncapsulation, HostBinding, AfterViewChecked } from '@angular/core';
import { ProtocoloDetalleComponent } from '../protocolos/protocolo-detalle.component';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PacienteService } from '../../../../../services/paciente.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LaboratorioContextoCacheService } from '../../services/protocoloCache.service';
import { ProtocoloService } from '../../services/protocolo.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
    selector: 'gestor-protocolos',
    templateUrl: 'gestor-protocolos.html',
    styleUrls: ['../../assets/laboratorio.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class GestorProtocolosComponent implements OnInit, AfterViewChecked {
    @HostBinding('class.plex-layout') layout = true;

    public seleccionPaciente: Boolean = false;
    public showListarProtocolos: Boolean = true;
    public showProtocoloDetalle: Boolean = false;
    public showBotonGuardar: Boolean = false;
    public editarListaPracticas: Boolean = false;
    public showBotonAceptarCambiosAuditoria: Boolean = false;
    public showBotonAceptarCambiosHeader: Boolean = false;

    public titulo;
    public contextoCache;

    public areas = [];

    public protocolos: any[];
    public protocolo: any;
    public terminarPracticasChecked: Boolean = false;
    routeParams: any;

    @Input('protocolo')
    set setProtocolo(value: any) {
        if (value) {
            this.seleccionarProtocolo(value, 0);
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


    @Input() paciente;
    //     if (value) {
    //         this.resetearProtocolo(value);
    //         this.seleccionarProtocolo({ protocolo: this.protocolo, index: 0 });
    //         this.editarListaPracticas = true;
    //         this.showProtocoloDetalle = true;
    //         this.laboratorioContextoCacheService.getContextoCache().indiceSeleccionado = 0;
    //         this.seleccionPaciente = false;
    //         this.laboratorioContextoCacheService.setPaciente();
    //     }
    // }

    public busqueda;
    public accionIndex;
    public permisoCarga;
    public permisoValidacion;
    public permisoAuditoria;

    @ViewChild(ProtocoloDetalleComponent)
    public protocoloDetalleComponent: ProtocoloDetalleComponent;

    constructor(
        public servicePaciente: PacienteService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public plex: Plex,
        public protocoloService: ProtocoloService,
        public auth: Auth,
        public laboratorioContextoCacheService: LaboratorioContextoCacheService, private cdRef: ChangeDetectorRef
    ) { }

    ngAfterViewChecked() {
        this.cdRef.detectChanges();
    }

    ngOnInit() {
        this.permisoCarga = this.auth.getPermissions('laboratorio:cargar:?').length;
        this.permisoAuditoria = this.auth.getPermissions('laboratorio:auditar:?').length;
        this.permisoValidacion = this.auth.getPermissions('laboratorio:validar:?').length;
        this.contextoCache = this.laboratorioContextoCacheService.getContextoCache();
        if (!this.permisoAuditoria && !this.permisoCarga && !this.permisoValidacion) {
            this.router.navigate(['./inicio']);
        }

        if (!this.protocolo) {
            this.resetearProtocolo({});
        }

        this.routeParams = this.activatedRoute.params.subscribe(params => {
            if (params['id']) {
                let turnoId = params['id'];

                // this.servicePaciente.getById(id).subscribe(pacienteMPI => {
                this.protocoloService.get({ turnos: [turnoId] }).subscribe(_protocolos => {
                    // if (this.contextoCache.turno) {
                        // this.resetearProtocolo(null, this.contextoCache.turno);
                        this.seleccionarProtocolo(_protocolos[0], 0);
                        this.showProtocoloDetalle = true;
                        this.showListarProtocolos = false;
                        this.contextoCache.mostrarCuerpoProtocolo = true;
                        this.contextoCache.edicionDatosCabecera = false;
                        this.contextoCache.ocultarPanelLateral = true;
                    // } else {
                    //     this.mostrarFomularioPacienteSinTurno();
                    //     this.seleccionPaciente = false;
                    //     this.seleccionarProtocolo(this.protocolo);
                    //     this.laboratorioContextoCacheService.ventanillaSinTurno();
                    // }
                });
            }
        });
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
        this.areas = filtros.areas ? filtros.areas : [];
        this.busqueda = filtros;

        this.busqueda.estadoFiltrar = this.laboratorioContextoCacheService.isModoListado() || this.laboratorioContextoCacheService.isModoValidacion() ? null : ['validada'];
        this.busqueda.estado = filtros.estados ? filtros.estados : [];

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
    seleccionarProtocolo(_protocolo, index) {
        // Si se presionó el boton suspender, no se muestran otros protocolos hasta que se confirme o cancele la acción.
        if (_protocolo) {
            this.laboratorioContextoCacheService.seleccionarProtocolo();
            this.editarListaPracticas = (!this.laboratorioContextoCacheService.isModoRecepcion());
            this.protocolo = _protocolo;
            this.laboratorioContextoCacheService.getContextoCache().indiceSeleccionado = index;
            this.showListarProtocolos = false;
            this.showProtocoloDetalle = true;
            this.seleccionPaciente = false;
            this.showBotonGuardar = true;
        }
    }

    /**
     * volverLista oculta panel de detalle de protolo y muestra en su lugar panel de lista de protocolos
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    volver() {
        this.laboratorioContextoCacheService.getContextoCache().indiceSeleccionado = null;
        if (this.laboratorioContextoCacheService.isModoRecepcionSinTurno()) {
            this.laboratorioContextoCacheService.cambiarModo(2);
            this.router.navigate(['/laboratorio/recepcion/']); // Navega al punto de inicio laboratorio
        } else if (this.contextoCache.edicionDatosCabecera) {
            this.aceptarCambiosHeader();
        } else {
            this.refreshSelection(this.busqueda);
            this.showListarProtocolos = true;
            this.showProtocoloDetalle = false;
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
    // mostrarFomularioPacienteSinTurno() {
    //     if (this.paciente) {
    //         this.resetearProtocolo(this.paciente);
    //         // this.seleccionarProtocolo({});
    //         this.showListarProtocolos = false;
    //         this.showProtocoloDetalle = true;
    //         this.laboratorioContextoCacheService.getContextoCache().indiceSeleccionado = 0;
    //         this.seleccionPaciente = true;
    //         // this.showBotonAceptar = true;

    //         this.contextoCache.mostrarCuerpoProtocolo = true;
    //         this.contextoCache.edicionDatosCabecera = true;
    //     }
    // }

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
        if (this.protocoloDetalleComponent.validarRecepcionPaciente()) {
            this.showBotonAceptarCambiosHeader = false;
            this.showBotonGuardar = true;
            this.protocoloDetalleComponent.aceptarEdicionCabecera();
        } else {
            this.plex.info('warning', 'Completar datos requeridos');
        }
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
        localStorage.setItem('filtros', JSON.stringify(filtrosPorDefecto));
        this.plex.toast('success', 'Se recordará su selección de filtro en sus próximas sesiones.', 'Información', 3000);
    }

}



