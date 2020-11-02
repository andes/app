import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding, ViewChild } from '@angular/core';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { TurnoService } from '../../../services/turnos/turno.service';
import { OrganizacionService } from '../../../services/organizacion.service';
import { Unsubscribe } from '@andes/shared';
import { HUDSService } from '../../../modules/rup/services/huds.service';
import { concat } from 'rxjs';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';

@Component({
    selector: 'solicitudes',
    templateUrl: './solicitudes.html'
})

export class SolicitudesComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    @ViewChild('modal', { static: true }) modal: PlexModalComponent;

    fecha: any;
    turnoSeleccionado: any;
    pacienteSeleccionado: any;
    showDarTurnos: boolean;
    solicitudTurno: any;
    showAuditar = false;
    private scrollEnd = false;
    private skip = 0;
    private limit = 15;
    public permisos;
    public showCargarSolicitud = false;
    public showBotonCargarSolicitud = true;

    public prestaciones = [];
    public showIniciarPrestacion = false;
    public tipoSolicitud = 'entrada';
    public prestacionesSalida = [];
    public prestacionesEntrada = [];
    public showEditarReglas = false;
    public panelIndex = 0;
    public activeTab = 0;
    public showSidebar = false;
    public prestacionesPermisos = [];
    public permisosReglas;
    public permisoAnular = false;
    public showAnular = false;
    public showCitar = false;
    public showDetalle = false;
    public showNuevaSolicitud = false;
    public prestacionesDestino = [];
    public estado;
    public asignadas = false;
    itemsDropdown: any = [];  // Acciones del dropdown 'vincular
    openedDropDown = null;
    public estadosEntrada = [
        { id: 'auditoria', nombre: 'AUDITORIA' },
        { id: 'pendiente', nombre: 'PENDIENTE' },
        { id: 'asignada', nombre: 'ASIGNADA' },
        { id: 'rechazada', nombre: 'CONTRARREFERIDA' },
        { id: 'turnoDado', nombre: 'TURNO DADO' },
        { id: 'registroHUDS', nombre: 'REGISTRO EN HUDS' },
        { id: 'anulada', nombre: 'ANULADA' }
    ];
    public estadosSalida = [
        { id: 'auditoria', nombre: 'AUDITORIA' },
        { id: 'pendiente', nombre: 'PENDIENTE' },
        { id: 'asignada', nombre: 'ASIGNADA' },
        { id: 'rechazada', nombre: 'CONTRARREFERIDA' },
        { id: 'turnoDado', nombre: 'TURNO DADO' },
        { id: 'registroHUDS', nombre: 'REGISTRO EN HUDS' },
        { id: 'anulada', nombre: 'ANULADA' }
    ];

    public prioridades = [
        { id: 'prioritario', nombre: 'PRIORITARIO' },
    ];
    prestacionSeleccionada: any;
    public showModalMotivo = false;
    public motivoVerContinuarPrestacion = 'Continuidad del cuidado del paciente';
    public routeToParams = [];
    public accesoHudsPrestacion = null;
    public accesoHudsPaciente = null;
    public accesoHudsTurno = null;
    public motivoRespuesta: String;
    public prestacionDevolver: any;
    // filtros
    public prioridadEntrada;
    public prioridadSalida;
    public estadoEntrada;
    public estadoSalida;
    public organizacionesDestino = [];
    public organizacionesOrigen = [];
    public fechaDesdeEntrada: Date = moment().startOf('day').toDate();
    public fechaHastaEntrada: Date = moment().startOf('day').toDate();
    public fechaDesdeSalida: Date = moment().startOf('day').toDate();
    public fechaHastaSalida: Date = moment().startOf('day').toDate();
    public pacienteEntrada: any;
    public pacienteSalida: any;
    public prestacionesDestinoEntrada = [];
    public prestacionesDestinoSalida = [];
    public mostrarMasOpcionesSalida = false;
    public mostrarMasOpcionesEntrada = false;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private servicioPrestacion: PrestacionesService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public servicioTurnos: TurnoService,
        public servicioOrganizacion: OrganizacionService,
        public router: Router, private route: ActivatedRoute,
        private hudsService: HUDSService,
    ) { }

    ngOnInit() {
        if (!this.auth.getPermissions('solicitudes:?').length) {
            this.router.navigate([this.auth.profesional ? '/solicitudes/asignadas' : 'inicio']);
        } else if (this.auth.getPermissions('solicitudes:?').length === 1 && this.auth.getPermissions('solicitudes:reglas:?')[0] !== '*') {
            this.router.navigate(['/solicitudes/asignadas']);
        }

        this.permisosReglas = this.auth.getPermissions('solicitudes:reglas:?').length > 0 ? this.auth.getPermissions('solicitudes:reglas:?')[0] === '*' : false;
        this.prestacionesPermisos = this.auth.getPermissions('solicitudes:tipoPrestacion:?');
        this.permisoAnular = this.auth.check('solicitudes:anular');
        this.showCargarSolicitud = false;
        let currentUrl = this.router.url;
        if (currentUrl === '/solicitudes/asignadas') {
            this.asignadas = true;
            this.estadosEntrada = [
                { id: 'asignada', nombre: 'ASIGNADA' }
            ];
            this.fechaDesdeEntrada = null;
            this.fechaHastaEntrada = null;
            this.fechaDesdeSalida = null;
            this.fechaHastaSalida = null;
            this.estadoEntrada = { id: 'asignada', nombre: 'ASIGNADA' };
        }
        this.buscarSolicitudes();
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    cambio(activeTab) {
        if (activeTab !== this.activeTab) {
            this.activeTab = activeTab;
            this.showSidebar = false;
            this.tipoSolicitud = (this.activeTab === 0) ? 'entrada' : 'salida';
            this.cargarSolicitudes();
        }
    }

    cerrar() {
        this.showDetalle = false;
        this.showAnular = false;
        this.showAuditar = false;
        this.showCitar = false;
        this.showIniciarPrestacion = false;
        this.showSidebar = false;
        this.showNuevaSolicitud = false;
    }

    seleccionar(prestacion) {
        (this.tipoSolicitud === 'entrada' ? this.prestacionesEntrada : this.prestacionesSalida).forEach(e => e.seleccionada = false);

        prestacion.seleccionada = true;
        this.prestacionSeleccionada = prestacion;
        if (prestacion.solicitud && prestacion.solicitud.turno) {
            this.servicioTurnos.getTurnos({ id: prestacion.solicitud.turno }).subscribe(turnos => {
                this.turnoSeleccionado = turnos[0].bloques[0].turnos[0];
                this.setShowDetallesFlags();
            });
        } else {
            this.turnoSeleccionado = null;
            this.setShowDetallesFlags();
        }
    }

    private setShowDetallesFlags() {
        this.showDetalle = true;
        this.showSidebar = true;
        this.showAnular = false;
        this.showAuditar = false;
        this.showIniciarPrestacion = false;
        this.showNuevaSolicitud = false;
    }

    darTurno(prestacionSolicitud) {
        // Pasar filtros al calendario
        this.solicitudTurno = prestacionSolicitud;
        this.pacienteSeleccionado = prestacionSolicitud.paciente;
        this.showDarTurnos = true;
    }

    cancelar(prestacionSolicitud) {
        this.plex.confirm('¿Realmente quiere cancelar la solicitud?', 'Atención').then(confirmar => {
            if (confirmar) {
                let cambioEstado: any = {
                    op: 'estadoPush',
                    estado: { tipo: 'anulada' }
                };
                // CAMBIEMOS e  l estado de la prestacion a 'anulada'
                this.servicioPrestacion.patch(prestacionSolicitud.id, cambioEstado).subscribe(prestacion => this.plex.toast('info', 'Prestación cancelada'), (err) => this.plex.toast('danger', 'ERROR: No es posible iniciar la prestación'));
            }
        });
    }

    anular(prestacion) {
        this.prestacionSeleccionada = prestacion;
        this.showAnular = true;
        this.showSidebar = true;
        this.showAuditar = false;
        this.showDetalle = false;
        this.showCitar = false;
        this.showNuevaSolicitud = false;
        this.showIniciarPrestacion = false;
    }

    citar(prestacion) {
        this.prestacionSeleccionada = prestacion;
        this.showCitar = true;
        this.showSidebar = true;
        this.showAnular = false;
        this.showAuditar = false;
        this.showDetalle = false;
        this.showNuevaSolicitud = false;
        this.showIniciarPrestacion = false;
    }

    onIniciarPrestacionClick(prestacion) {
        this.prestacionSeleccionada = prestacion;
        this.showIniciarPrestacion = true;
        this.showSidebar = true;
        this.showCitar = false;
        this.showAnular = false;
        this.showAuditar = false;
        this.showDetalle = false;
        this.showNuevaSolicitud = false;
    }

    volverDarTurno() {
        this.cargarSolicitudes();
        this.showDarTurnos = false;
        this.solicitudTurno = null;
    }

    volverReglas() {
        this.cargarSolicitudes();
        this.showEditarReglas = false;
    }

    auditar(prestacion) {
        this.prestacionSeleccionada = prestacion;
        this.showAuditar = true;
        this.showSidebar = true;
        this.showAnular = false;
        this.showDetalle = false;
        this.showCitar = false;
        this.showIniciarPrestacion = false;
        this.showNuevaSolicitud = false;
    }

    editarReglas() {
        this.showEditarReglas = true;
    }

    onPacienteChange() {
        if ((!this.pacienteSalida || this.pacienteSalida.length >= 3) || (!this.pacienteEntrada || this.pacienteEntrada.length >= 3)) {
            this.cargarSolicitudes();
        }
    }

    cargarSolicitudes() {
        (this.tipoSolicitud === 'entrada' ? this.prestacionesEntrada : this.prestacionesSalida).length = 0;
        this.skip = 0;
        this.scrollEnd = false;
        this.buscarSolicitudes();
    }

    getParams() {
        let params: any = {
            ordenFechaDesc: true,
            estados: [
                'auditoria',
                'pendiente',
                'rechazada',
                'validada',
                'ejecucion',
                'asignada'
            ]
        };
        if (this.tipoSolicitud === 'entrada') {
            params['solicitudDesde'] = this.fechaDesdeEntrada;
            params['solicitudHasta'] = this.fechaHastaEntrada;
            params.referidas = true;
            if (this.asignadas) {
                params['idProfesional'] = this.auth.profesional;
            }
            if (this.estadoEntrada) {
                if (this.estadoEntrada.id === 'turnoDado') {
                    params['tieneTurno'] = true;
                    params.estados = params.estados.filter(e => e !== 'validada');
                } else if (this.estadoEntrada.id === 'registroHUDS') {
                    params['estados'] = ['validada'];
                } else {
                    params['estados'] = [this.estadoEntrada.id];
                    if (this.estadoEntrada.id === 'pendiente') {
                        params['tieneTurno'] = false;
                    }
                }
                if (this.prestacionesDestinoEntrada && this.prestacionesDestinoEntrada.length) {
                    params['prestacionDestino'] = this.prestacionesDestinoEntrada.map(e => e.conceptId);
                }
            }
            if (this.prestacionesDestinoEntrada && this.prestacionesDestinoEntrada.length) {
                params['prestacionDestino'] = this.prestacionesDestinoEntrada.map(e => e.conceptId);
            } else {
                if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
                    params['tipoPrestaciones'] = this.prestacionesPermisos;
                }
            }
            if (this.prioridadEntrada) {
                params['prioridad'] = this.prioridadEntrada.id;
            }
            if (this.pacienteEntrada && this.pacienteEntrada.length >= 3) {
                params['paciente'] = this.pacienteEntrada;
            }
        } else {
            params['solicitudDesde'] = this.fechaDesdeSalida;
            params['solicitudHasta'] = this.fechaHastaSalida;
            if (this.asignadas) {
                params['idProfesionalOrigen'] = this.auth.profesional;
            }
            if (this.estadoSalida) {
                if (this.estadoSalida.id === 'turnoDado') {
                    params['tieneTurno'] = true;
                    params.estados = params.estados.filter(e => e !== 'validada');
                } else if (this.estadoSalida.id === 'registroHUDS') {
                    params['estados'] = ['validada'];
                } else {
                    params['estados'] = [this.estadoSalida.id];
                    if (this.estadoSalida.id === 'pendiente') {
                        params['tieneTurno'] = false;
                    }
                }
                if (this.prestacionesDestinoSalida && this.prestacionesDestinoSalida.length) {
                    params['prestacionDestino'] = this.prestacionesDestinoSalida.map(e => e.conceptId);
                }
            }
            if (this.prestacionesDestinoSalida && this.prestacionesDestinoSalida.length) {
                params['prestacionDestino'] = this.prestacionesDestinoSalida.map(e => e.conceptId);
            } else {
                if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
                    params['tipoPrestaciones'] = this.prestacionesPermisos;
                }
            }
            if (this.prioridadSalida) {
                params['prioridad'] = this.prioridadSalida.id;
            }
            if (this.pacienteSalida && this.pacienteSalida.length >= 3) {
                params['paciente'] = this.pacienteSalida;
            }
        }
        this.setOrganizacionesParams(params);
        params['skip'] = this.skip;
        params['limit'] = this.limit;
        return params;
    }

    // Setea parametros de búsqueda por organizaciones
    private setOrganizacionesParams(params) {
        if (this.tipoSolicitud === 'entrada') {
            // Si es bandeja de entrada, por defecto la organización es la propia
            params.organizacion = this.auth.organizacion.id;
            if (this.organizacionesOrigen && this.organizacionesOrigen.length) {
                params.organizacionOrigen = this.organizacionesOrigen.map(o => o.id);
            }
        } else {
            // Si es bandeja de entrada, por defecto la organización origen es la propia
            params.organizacionOrigen = this.auth.organizacion.id;
            if (this.organizacionesDestino && this.organizacionesDestino.length) {
                params.organizacion = this.organizacionesDestino.map(o => o.id);
            }
        }
    }

    @Unsubscribe()
    buscarSolicitudes() {
        return this.servicioPrestacion.getSolicitudes(this.getParams()).subscribe(resultado => {
            if (this.tipoSolicitud === 'entrada') {
                this.prestacionesEntrada = this.prestacionesEntrada.concat(resultado);
                this.skip = this.prestacionesEntrada.length;
            } else if (this.tipoSolicitud === 'salida') {
                this.prestacionesSalida = this.prestacionesSalida.concat(resultado);
                this.skip = this.prestacionesSalida.length;
            }
            // si vienen menos solicitudes que la cantidad límite significa que ya se cargaron todas
            if (!resultado.length || resultado.length < this.limit) {
                this.scrollEnd = true;
            }
        });
    }

    afterDetalleSolicitud(event) {
        this.showSidebar = false;
        this.showAnular = false;
        this.showAuditar = false;
        this.showDetalle = false;
        this.showCitar = false;
        this.showIniciarPrestacion = false;
        this.showNuevaSolicitud = false;
    }

    returnAuditoria(event) {
        this.showAuditar = false;
        this.showSidebar = false;
        if (event.status !== false) {
            const statuses = ['pendiente', 'asignada', 'rechazada', 'referida'];
            if (event.status !== this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length) {
                let patch: any;

                if (event.status !== 3) {
                    patch = {
                        op: 'estadoPush',
                        estado: { tipo: statuses[event.status], observaciones: event.observaciones }
                    };

                    // DEPRECADO
                    if (!event.status) {
                        patch.motivoRechazo = event.observaciones;
                    }
                    if (event.prioridad) {
                        patch.prioridad = event.prioridad;
                    }
                    if (event.profesional) {
                        patch.profesional = event.profesional;
                    }

                } else {
                    patch = {
                        op: 'referir',
                        estado: event.estado,
                        observaciones: event.observaciones,
                        organizacion: event.organizacion,
                        profesional: event.profesional,
                        tipoPrestacion: event.prestacion
                    };
                }
                this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                    respuesta => this.cargarSolicitudes()
                );
            }
        }
    }

    returnAnular(event) {
        this.showAnular = false;
        this.showSidebar = false;
        if (event.status === false) {
            if (this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length > 0) {
                let patch = {
                    op: 'estadoPush',
                    estado: {
                        tipo: 'anulada',
                        motivoRechazo: event.motivo, // 'motivoRechazo' se reemplaza con 'observaciones'
                        observaciones: event.motivo
                    }
                };
                this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                    respuesta => this.cargarSolicitudes()
                );
            }
        }
    }

    onScroll() {
        if (!this.scrollEnd) {
            this.buscarSolicitudes();
        }
    }

    returnCitar(event) {
        this.showCitar = false;
        this.showSidebar = false;
        if (event.status === false) {
            if (this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados.length > 0) {
                let patch = {
                    op: 'citar',
                    estado: {
                        tipo: 'pendiente',
                        observaciones: event.motivo
                    }
                };
                this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                    respuesta => this.cargarSolicitudes()
                );
            }
        }
    }

    routeTo(action, id) {
        if (id) {
            this.router.navigate(['huds/' + action + '/', id]);
        } else {
            this.router.navigate(['huds/' + action]);
        }
    }

    setRouteToParams(params) {
        this.routeToParams = params;
    }

    preAccesoHuds(motivoAccesoHuds) {
        if (motivoAccesoHuds) {
            if (!this.accesoHudsPaciente && !this.accesoHudsPrestacion && this.routeToParams && this.routeToParams[0] === 'huds') {
                // Se esta accediendo a 'HUDS DE UN PACIENTE'
                window.sessionStorage.setItem('motivoAccesoHuds', motivoAccesoHuds);
            } else {
                if (this.accesoHudsPaciente) {
                    this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, this.accesoHudsPaciente, motivoAccesoHuds, this.auth.profesional, this.accesoHudsTurno, this.accesoHudsPrestacion).subscribe(hudsToken => {
                        // se obtiene token y loguea el acceso a la huds del paciente
                        window.sessionStorage.setItem('huds-token', hudsToken.token);
                        this.routeToParams = [];
                        this.accesoHudsPaciente = null;
                        this.accesoHudsTurno = null;
                        this.accesoHudsPrestacion = null;
                    });
                }

            }
            this.routeTo(this.routeToParams[0], (this.routeToParams[1]) ? this.routeToParams[1] : null);

        }
        this.showModalMotivo = false;
    }

    setAccesoHudsParams(paciente, turno, prestacion) {
        this.accesoHudsPaciente = paciente;
        this.accesoHudsTurno = turno;
        this.accesoHudsPrestacion = prestacion;
        this.showModalMotivo = true;
    }

    returnPrestacion(event) {
        this.showIniciarPrestacion = false;
        this.showSidebar = false;
        if (event.status === false) {
            this.plex.confirm(`Paciente: <b>${this.prestacionSeleccionada.paciente.apellido}, ${this.prestacionSeleccionada.paciente.nombre}.</b><br>Prestación: <b>${this.prestacionSeleccionada.solicitud.tipoPrestacion.term}</b>, ¿Está seguro de querer iniciar una pestación?`)
                .then(confirmacion => {
                    if (confirmacion) {
                        this.confirmarIniciarPrestacion(event);
                    }
                });
        }
    }

    private confirmarIniciarPrestacion(data) {
        concat(
            // token HUDS
            this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, this.prestacionSeleccionada.paciente, 'Fuera de agenda', this.auth.profesional, null, this.prestacionSeleccionada.solicitud.tipoPrestacion.id),
            // PATCH pasar prestacion a ejecución
            this.iniciarPrestacion(data.fecha, data.observaciones)
        ).subscribe(
            () => this.router.navigate(['/rup/ejecucion', this.prestacionSeleccionada.id]),
            (err) => this.plex.info('danger', 'La prestación no pudo ser iniciada. ' + err)
        );
    }

    private iniciarPrestacion(fecha, observaciones?) {
        let patch: any = {
            op: 'estadoPush',
            ejecucion: {
                fecha,
                organizacion: this.auth.organizacion
            },
            estado: {
                fecha: new Date(),
                tipo: 'ejecucion'
            }
        };

        if (observaciones) {
            patch.estado.observaciones = observaciones;
        }
        return this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch);
    }

    devolver(prestacion) {
        this.prestacionDevolver = prestacion;
        this.modal.showed = true;
    }

    confirmarDevolver() {
        this.servicioPrestacion.patch(this.prestacionDevolver.id, { op: 'devolver', observaciones: this.motivoRespuesta }).subscribe(() => {
            this.cerrarDevolver();
            this.cargarSolicitudes();
        });
    }

    cerrarDevolver() {
        this.modal.showed = false;
        this.prestacionDevolver = null;
        this.motivoRespuesta = null;
    }

    nuevaSolicitud() {
        this.showNuevaSolicitud = true;
        this.showAuditar = false;
        this.showSidebar = true;
        this.showAnular = false;
        this.showDetalle = false;
        this.showCitar = false;
        this.showIniciarPrestacion = false;
    }

    returnBusqueda(event) {
        if (event.status) {
            this.tipoSolicitud = (this.activeTab === 0) ? 'entrada' : 'salida';
            this.router.navigate([`/solicitudes/${this.tipoSolicitud}/${event.paciente}`]);
        } else {
            this.showSidebar = false;
            this.showNuevaSolicitud = false;
        }
    }

    setDropDown(prestacion, drop) {
        if (this.openedDropDown) {
            this.openedDropDown.open = (this.openedDropDown === drop) ? true : false;
        }
        if (prestacion.id) {
            this.openedDropDown = drop;
            this.itemsDropdown = [];
            if (prestacion.estadoActual.tipo === 'asignada') {
                this.itemsDropdown[0] = { icon: 'clipboard-arrow-left', label: prestacion.solicitud.profesional?.id === this.auth.profesional ? 'Devolver' : 'Deshacer', handler: () => { this.devolver(prestacion); } };
                if (prestacion.solicitud.organizacion.id === this.auth.organizacion.id && prestacion.solicitud.profesional?.id === this.auth.profesional && prestacion.paciente) {
                    this.itemsDropdown[1] = {
                        icon: 'contacts', label: 'Ver Huds', handler: () => {
                            this.setRouteToParams(['paciente', prestacion.paciente.id]);
                            this.setAccesoHudsParams(prestacion.paciente, null, prestacion.solicitud.tipoPrestacion.id);
                        }
                    };
                }
            }
        }
    }

}
