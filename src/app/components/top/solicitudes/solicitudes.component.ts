import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { Unsubscribe } from '@andes/shared';
import { Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, concatWith } from 'rxjs';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { RouterService } from 'src/app/services/router.service';
import { HUDSService } from '../../../modules/rup/services/huds.service';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { TurnoService } from '../../../services/turnos/turno.service';
import { PlexHelpComponent } from '@andes/plex/src/lib/help/help.component';

@Component({
    selector: 'solicitudes',
    templateUrl: './solicitudes.html',
    styleUrls: ['solicitudes.scss']
})

export class SolicitudesComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    @ViewChild('modalDevolver', { static: true }) modalDevolver: PlexModalComponent;
    @ViewChild('modalIniciar', { static: true }) modalIniciar: PlexModalComponent;
    @ViewChild('helpIniciar', { static: false }) helpIniciar: PlexHelpComponent;
    @ViewChild('helpAnular', { static: false }) helpAnular: PlexHelpComponent;
    @ViewChild('helpCitar', { static: false }) helpCitar: PlexHelpComponent;
    @ViewChild('columnas', { static: false }) columnas: ElementRef;

    fecha: any;
    turnoSeleccionado: any;
    pacienteSeleccionado: any;
    showDarTurnos: boolean;
    solicitudTurno: any;
    diasIntervalo = 15;

    private scrollEnd = false;
    private skip = 0;
    private limit = 15;
    public permisos;
    public showCargarSolicitud = false;
    public tipoSolicitud = 'entrada';
    public prestacionesSalida = [];
    public prestacionesEntrada = [];
    public showEditarReglas = false;
    public panelIndex = 0;
    public activeTab = 0;
    public showSidebar = false;
    public showPacienteData = true;
    public prestacionesPermisos = [];
    public permisosReglas;
    public permisoAnular = false;
    public showDetalle = false;
    public showNuevaSolicitud = false;
    public prestacionesDestino = [];
    public asignadas = false;

    public selectEstados = [
        { id: 'auditoria', nombre: 'AUDITORIA' },
        { id: 'pendiente', nombre: 'PENDIENTE' },
        { id: 'asignada', nombre: 'ASIGNADA' },
        { id: 'rechazada', nombre: 'CONTRARREFERIDA' },
        { id: 'ejecucion', nombre: 'EJECUCIÓN' },
        { id: 'turnoDado', nombre: 'TURNO DADO' },
        { id: 'registroHUDS', nombre: 'REGISTRO EN HUDS' },
        { id: 'anulada', nombre: 'ANULADA' },
        { id: 'vencida', nombre: 'VENCIDA' }
    ];

    public prioridades = [
        { id: 'prioritario', nombre: 'PRIORITARIO' },
    ];
    prestacionSeleccionada: any;
    public showModalMotivo = false;
    public motivoVerContinuarPrestacion = 'Continuidad del cuidado del paciente';
    public routeToParams = [];
    public prestacionNominalizada = null;
    public accesoHudsPrestacion = null;
    public accesoHudsPaciente = null;
    public accesoHudsTurno = null;
    public motivoRespuesta: String;
    public observacionesCitar;
    public observacionesAnular;
    public observacionesIniciarPrestacion;
    public fechaInicioPrestacion = new Date();
    // filtros
    public prioridadEntrada;
    public prioridadSalida;
    public estadoEntrada;
    public estadoSalida;
    public organizacionesDestino = [];
    public organizacionesOrigen = [];
    public profesionalDestino;
    public fechaDesdeEntrada: Date = moment().startOf('day').toDate();
    public fechaHastaEntrada: Date = moment().startOf('day').toDate();
    public fechaDesdeSalida: Date = moment().startOf('day').toDate();
    public fechaHastaSalida: Date = moment().startOf('day').toDate();
    public fechaDesdeEntradaActualizacion: Date = moment().startOf('day').toDate();
    public fechaHastaEntradaActualizacion: Date = moment().startOf('day').toDate();
    public fechaDesdeSalidaActualizacion: Date = moment().startOf('day').toDate();
    public fechaHastaSalidaActualizacion: Date = moment().startOf('day').toDate();
    public fechaNotificacion = new Date();
    public descripcionNotificacion = '';
    public hoy: Date = moment().toDate();
    public pacienteEntrada: any;
    public pacienteSalida: any;
    public prestacionesDestinoEntrada = [];
    public prestacionesDestinoSalida = [];
    public mostrarMasOpcionesSalida = false;
    public mostrarMasOpcionesEntrada = false;
    public mostrarAlertaRangoDias = false;
    public actualizacion = false;
    public check;
    public collapse = false;
    public loader = true;
    public columns = [
        {
            key: 'fecha',
            label: 'Fecha',
        },
        {
            key: 'paciente',
            label: 'Paciente',
        },
        {
            key: 'origen',
            label: 'Datos de origen',
        },
        {
            key: 'destino',
            label: 'Datos de destino',
        },
        {
            key: 'actualizacion',
            label: 'actualización',
        },
        {
            key: 'EstadoAcciones',
            label: ''
        },
    ];

    // Permite :hover y click()
    @Input() selectable = true;

    // Muestra efecto de selección
    @Input() selected = false;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private servicioPrestacion: PrestacionesService,
        public servicioTurnos: TurnoService,
        public router: Router,
        private hudsService: HUDSService,
        private pacienteService: PacienteService,
        private routerService: RouterService
    ) {
    }

    ngOnInit() {
        this.initFechas();

        if (!this.auth.getPermissions('solicitudes:?').length) {
            this.router.navigate([this.auth.profesional ? '/solicitudes/asignadas' : 'inicio']);
        } else if (this.auth.getPermissions('solicitudes:?').length === 1 && this.auth.getPermissions('solicitudes:reglas:?')[0] !== '*' && !this.auth.getPermissions('solicitudes:tipoPrestacion:?').length) {
            this.router.navigate(['/solicitudes/asignadas']);
        }

        this.permisosReglas = this.auth.getPermissions('solicitudes:reglas:?').length > 0 ? this.auth.getPermissions('solicitudes:reglas:?')[0] === '*' : false;
        this.prestacionesPermisos = this.auth.getPermissions('solicitudes:tipoPrestacion:?');
        this.permisoAnular = this.auth.check('solicitudes:anular');
        this.showCargarSolicitud = false;
        const currentUrl = this.router.url;

        if (currentUrl === '/solicitudes/asignadas') {
            this.asignadas = true;
            this.selectEstados = [
                { id: 'asignada', nombre: 'ASIGNADA' }
            ];

            this.fechaDesdeEntrada = null;
            this.fechaHastaEntrada = null;
            this.fechaDesdeSalida = null;
            this.fechaHastaSalida = null;

            if (this.tipoSolicitud === 'entrada') {
                this.fechaHastaEntrada = moment().startOf('day').toDate();
                this.fechaDesdeEntrada = moment(this.fechaHastaEntrada).subtract(this.diasIntervalo, 'days').toDate();
            }
            this.estadoEntrada = { id: 'asignada', nombre: 'ASIGNADA' };
        }
        this.buscarSolicitudes();
    }

    initFechas() {
        const prevUrl = this.routerService.getPreviousUrl();

        if (prevUrl === '/solicitudes') {
            this.resetFechas();
        } else {
            if (prevUrl.includes('/solicitudes')) {
                this.recuperarFechas();
            }
        }
    }

    recuperarFechas() {
        const solicitudes = JSON.parse(localStorage.getItem('solicitudes'));
        const fechaHoy = moment().startOf('day').toDate();

        this.fechaDesdeEntrada = solicitudes.fechaDesdeEntrada || fechaHoy;
        this.fechaHastaEntrada = solicitudes.fechaHastaEntrada || fechaHoy;
        this.fechaDesdeSalida = solicitudes.fechaDesdeSalida || fechaHoy;
        this.fechaHastaSalida = solicitudes.fechaHastaSalida || fechaHoy;
    }

    resetFechas() {
        localStorage.setItem('solicitudes', JSON.stringify({}));
    }

    guardarFechas() {
        localStorage.setItem('solicitudes', JSON.stringify({ fechaDesdeEntrada: this.fechaDesdeEntrada, fechaHastaEntrada: this.fechaHastaEntrada, fechaDesdeSalida: this.fechaDesdeSalida, fechaHastaSalida: this.fechaHastaSalida }));
    }

    cambioFechaDesde() {
        const diferencia = moment(this.fechaHastaEntrada).diff(this.fechaDesdeEntrada, 'days');

        if (this.fechaDesdeEntrada) {
            this.mostrarAlertaRangoDias = false;
            if (!this.fechaHastaEntrada || (diferencia < 0) || (Math.abs(diferencia) > this.diasIntervalo)) {
                this.fechaHastaEntrada = moment(this.fechaDesdeEntrada).add(this.diasIntervalo, 'days').toDate();
                this.mostrarAlertaRangoDias = true;
            }

            this.cargarSolicitudes();
        }
    }

    cambioFechaHasta() {
        const diferencia = moment(this.fechaHastaEntrada).diff(this.fechaDesdeEntrada, 'days');

        if (this.fechaHastaEntrada) {
            this.mostrarAlertaRangoDias = false;
            if (!this.fechaDesdeEntrada || (diferencia < 0) || (Math.abs(diferencia) > this.diasIntervalo)) {
                this.fechaDesdeEntrada = moment(this.fechaHastaEntrada).subtract(this.diasIntervalo, 'days').toDate();
                this.mostrarAlertaRangoDias = true;
            }

            this.cargarSolicitudes();
        }

        this.guardarFechas();
    }

    cambio(activeTab) {
        if (activeTab !== this.activeTab) {
            this.actualizacion = false;
            this.check = false;
            this.actualizarFechas();
            this.activeTab = activeTab;
            this.tipoSolicitud = (this.activeTab === 0) ? 'entrada' : 'salida';
            this.closeSidebar();
            this.cargarSolicitudes();
        }
    }

    closeSidebar() {
        const tableCols = (this.columnas as any)?.columns$.source._value;
        if (tableCols && !tableCols.some(col => col.key === 'paciente')) {
            tableCols.splice(1, 0, { key: 'paciente', label: 'Paciente' });
            this.showPacienteData = true;
        }
        this.showSidebar = false;
        this.showDetalle = false;
        this.showNuevaSolicitud = false;
    }

    seleccionar(prestacion) {
        if (this.prestacionSeleccionada?.id === prestacion.id) {
            this.prestacionSeleccionada = null;
            this.closeSidebar();
        } else {
            this.prestacionSeleccionada = prestacion;
            const tableCols = (this.columnas as any).columns$.source._value;
            if (tableCols.some(col => col.key === 'paciente')) {
                (this.columnas as any).columns$.source._value.splice(1, 1);
                this.showPacienteData = false;
            }
            (this.tipoSolicitud === 'entrada' ? this.prestacionesEntrada : this.prestacionesSalida).forEach(e => e.seleccionada = false);

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
    }

    private setShowDetallesFlags() {
        this.showDetalle = true;
        this.showSidebar = true;
        this.showNuevaSolicitud = false;
    }

    anular() {
        this.closeSidebar();
        if (this.prestacionSeleccionada.estados?.length) {
            const patch = {
                op: 'estadoPush',
                estado: {
                    tipo: 'anulada',
                    observaciones: this.observacionesAnular
                }
            };
            this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(
                () => this.cargarSolicitudes()
            );
        }
    }

    citar() {
        if (this.prestacionSeleccionada.estados?.length) {
            const patch = {
                op: 'citar',
                estado: {
                    tipo: 'pendiente',
                    observaciones: this.observacionesCitar
                }
            };
            this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(() => {
                this.closeSidebar();
                this.cargarSolicitudes();
            });
        }
    }

    // verifica que el tipo de prestación este entre las autorizadas para el profesional
    isPrestationEnabled(prestacion) {
        return this.auth.check('rup:tipoPrestacion:' + prestacion?.solicitud.tipoPrestacion.id);
    }

    volverReglas() {
        this.cargarSolicitudes();
        this.showEditarReglas = false;
    }

    editarReglas() {
        this.showEditarReglas = true;
    }

    onPacienteChange() {
        if ((!this.pacienteSalida || this.pacienteSalida.length >= 3) || (!this.pacienteEntrada || this.pacienteEntrada.length >= 3)) {
            this.loader = true;
            this.cargarSolicitudes();
        }
    }

    cargarSolicitudes() {
        this.prestacionSeleccionada = null;
        this.guardarFechas();

        (this.tipoSolicitud === 'entrada' ? this.prestacionesEntrada : this.prestacionesSalida).length = 0;
        this.skip = 0;
        this.scrollEnd = false;

        if ((this.tipoSolicitud === 'entrada' && (this.fechaDesdeEntrada && this.fechaHastaEntrada)) ||
            (this.tipoSolicitud === 'entrada' && (this.fechaDesdeEntradaActualizacion && this.fechaHastaEntradaActualizacion))) {
            this.loader = true;
            this.buscarSolicitudes();
        }

        if ((this.tipoSolicitud === 'salida' && this.fechaDesdeSalida && this.fechaHastaSalida) ||
            (this.tipoSolicitud === 'salida' && this.fechaDesdeSalidaActualizacion && this.fechaHastaSalidaActualizacion)) {
            this.loader = true;
            this.buscarSolicitudes();
        }
    }

    getParams() {
        const params: any = {
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
            if (this.fechaDesdeEntrada && this.fechaHastaEntrada) {
                params['solicitudDesde'] = this.fechaDesdeEntrada;
                params['solicitudHasta'] = this.fechaHastaEntrada;
                params['ordenFechaDesc'] = true;
            } else {
                params['solicitudDesdeActualizacion'] = this.fechaDesdeEntradaActualizacion;
                params['solicitudHastaActualizacion'] = this.fechaHastaEntradaActualizacion;
                params['ordenFechaDescAct'] = true;
            }
            /*
                TODO: Se remueve temporalmente la inclusión de referidas en la búsqueda de prestaciones.
                Se verá de agregar un checkbox para búsueda de referidas a demanda.
            */
            if (this.asignadas) {
                params['idProfesional'] = this.auth.profesional;
            } else if (this.profesionalDestino?.id) {
                params['idProfesional'] = this.profesionalDestino.id;
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
            if (this.fechaDesdeSalida && this.fechaHastaSalida) {
                params['solicitudDesde'] = this.fechaDesdeSalida;
                params['solicitudHasta'] = this.fechaHastaSalida;
                params['ordenFechaDesc'] = true;
            } else {
                params['solicitudDesdeActualizacion'] = this.fechaDesdeSalidaActualizacion;
                params['solicitudHastaActualizacion'] = this.fechaHastaSalidaActualizacion;
                params['ordenFechaDescAct'] = true;
            }
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
            this.loader = false;
        });
    }


    returnAuditoria(event) {
        this.closeSidebar();
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
                    () => this.cargarSolicitudes()
                );
            }
        }
    }

    onNotificarPaciente() {
        const patch = {
            op: 'notificar',
            observaciones: this.descripcionNotificacion,
            organizacion: this.prestacionSeleccionada.solicitud.historial[this.prestacionSeleccionada.solicitud.historial.length - 1].organizacion,
            tipoPrestacion: this.prestacionSeleccionada.solicitud.historial[this.prestacionSeleccionada.solicitud.historial.length - 1].tipoPrestacion,
            fechaNotificacion: this.fechaNotificacion
        };
        this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(() => {
            this.plex.toast('success', 'Paciente notificado con éxito.');
            this.cargarSolicitudes();
        }, error => {
            this.plex.toast('danger', 'Ha ocurrido un error al notificar al paciente.');
        });
        this.closeSidebar();
    }

    onScroll() {
        if (!this.scrollEnd) {
            this.buscarSolicitudes();
        }
    }

    routeTo(action, id) {
        if (action === 'paciente') {
            this.router.navigate(['huds', 'paciente', id]);
        } else {
            if (id) {
                this.router.navigate(['rup/' + action + '/', id]);
            } else {
                this.router.navigate(['rup/' + action]);
            }
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
                    const paramsToken = {
                        usuario: this.auth.usuario,
                        organizacion: this.auth.organizacion,
                        paciente: this.accesoHudsPaciente,
                        motivo: motivoAccesoHuds,
                        profesional: this.auth.profesional,
                        idTurno: this.accesoHudsTurno,
                        idPrestacion: this.accesoHudsPrestacion
                    };
                    this.hudsService.generateHudsToken(paramsToken).subscribe(hudsToken => {
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

    nuevaSolicitud() {
        this.showNuevaSolicitud = true;
        this.showDetalle = false;
        this.showSidebar = true;
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

    onChange() {
        this.closeSidebar();
        this.actualizacion = !this.actualizacion;
        this.actualizarFechas();
        this.loader = true;
        this.buscarSolicitudes();
    }

    actualizarFechas() {
        if (this.tipoSolicitud === 'entrada') {
            this.prestacionesEntrada = [];
            if (this.actualizacion) {
                this.fechaDesdeEntrada = null;
                this.fechaHastaEntrada = null;
                this.fechaDesdeEntradaActualizacion = moment().startOf('day').toDate();
                this.fechaHastaEntradaActualizacion = moment().startOf('day').toDate();
            } else {
                this.fechaDesdeEntrada = moment().startOf('day').toDate();
                this.fechaHastaEntrada = moment().startOf('day').toDate();
                this.fechaDesdeEntradaActualizacion = null;
                this.fechaHastaEntradaActualizacion = null;
            }
        } else {
            this.prestacionesSalida = [];
            if (this.actualizacion) {
                this.fechaDesdeSalida = null;
                this.fechaHastaSalida = null;
                this.fechaDesdeSalidaActualizacion = moment().startOf('day').toDate();
                this.fechaHastaSalidaActualizacion = moment().startOf('day').toDate();
            } else {
                this.fechaDesdeSalida = moment().startOf('day').toDate();
                this.fechaHastaSalida = moment().startOf('day').toDate();
                this.fechaDesdeSalidaActualizacion = null;
                this.fechaHastaSalidaActualizacion = null;
            }
        }
    }

    // --------------------- ACCION DE BOTONES -----------------------------

    onConfirmarIniciarPrestacion() {
        // token HUDS
        const paramsToken = {
            usuario: this.auth.usuario,
            organizacion: this.auth.organizacion,
            paciente: this.prestacionSeleccionada.paciente,
            motivo: 'Fuera de agenda',
            profesional: this.auth.profesional,
            idTurno: null,
            idPrestacion: this.prestacionSeleccionada.solicitud.tipoPrestacion.id
        };
        // patch config
        const patch: any = {
            op: 'estadoPush',
            ejecucion: {
                fecha: this.fechaInicioPrestacion,
                organizacion: this.auth.organizacion
            },
            estado: {
                fecha: new Date(),
                tipo: 'ejecucion'
            }
        };
        this.hudsService.generateHudsToken(paramsToken).pipe(
            concatWith(this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch)),
            catchError(err => this.plex.info('danger', 'La prestación no pudo ser iniciada. ' + err))
        ).subscribe(() => this.router.navigate(['/rup/ejecucion', this.prestacionSeleccionada.id]));
    }

    onDarTurno() {
        this.pacienteService.getById(this.prestacionSeleccionada.paciente.id).subscribe(paciente => {
            // Si se seleccionó por error un paciente fallecido
            this.pacienteService.checkFallecido(paciente);
        });
        this.servicioPrestacion.getById(this.prestacionSeleccionada._id).subscribe(prestacion => {
            if (prestacion.solicitud.turno) {
                this.plex.info('warning', 'La solicitud ya tiene un turno asignado.');
                this.cargarSolicitudes();
            } else {
                // Pasar filtros al calendario
                this.solicitudTurno = this.prestacionSeleccionada;
                this.pacienteSeleccionado = this.prestacionSeleccionada.paciente;
                this.showDarTurnos = true;
            }
        });
    }

    volverDarTurno() {
        this.showDarTurnos = false;
        this.solicitudTurno = null;
        this.closeSidebar();
        this.cargarSolicitudes();
    }

    onCancelar() {
        this.plex.confirm('¿Realmente quiere cancelar la solicitud?', 'Atención').then(confirmar => {
            if (confirmar) {
                const cambioEstado: any = {
                    op: 'estadoPush',
                    estado: { tipo: 'anulada' }
                };
                // CAMBIA el estado de la prestacion a 'anulada'
                this.servicioPrestacion.patch(this.prestacionSeleccionada.id, cambioEstado).subscribe({
                    complete: () => {
                        this.closeSidebar();
                        this.cargarSolicitudes();
                        this.plex.toast('info', 'Prestación cancelada');
                    },
                    error: () => this.plex.toast('danger', 'ERROR: No es posible cancelar la prestación')
                });
            }
        });
    }

    onContinuarRegistro() {
        this.setRouteToParams(['ejecucion', this.prestacionSeleccionada.id]);
        this.preAccesoHuds(this.motivoVerContinuarPrestacion);
        this.accesoHudsPaciente = this.prestacionSeleccionada.paciente;
        this.accesoHudsTurno = null;
        this.accesoHudsPrestacion = this.prestacionSeleccionada.solicitud.tipoPrestacion.id;
        this.prestacionNominalizada = this.prestacionSeleccionada.solicitud.tipoPrestacion.noNominalizada;
    }

    onVerHuds() {
        this.setRouteToParams(['paciente', this.prestacionSeleccionada.paciente.id]);
        this.setAccesoHudsParams(this.prestacionSeleccionada.paciente, null, this.prestacionSeleccionada.solicitud.tipoPrestacion.id);
    }

    onConfirmarDevolver() {
        this.servicioPrestacion.patch(this.prestacionSeleccionada.id, { op: 'devolver', observaciones: this.motivoRespuesta }).subscribe(() => {
            this.hideModal('devolver');
            this.closeSidebar();
            this.cargarSolicitudes();
        });
    }

    showModal(modal: string) {
        switch (modal) {
            case 'iniciar':
                this.modalIniciar.showed = true;
                break;
            case 'devolver': this.modalDevolver.showed = true;
                break;
        }
    }

    hideModal(modal: string) {
        switch (modal) {
            case 'iniciar':
                this.modalIniciar.showed = false;
                break;
            case 'devolver':
                this.modalDevolver.showed = false;
                this.motivoRespuesta = '';
                break;
        }
    }

    existeNotificacion(prestacion) {
        if (prestacion.solicitud.historial) {
            return (prestacion.solicitud.historial.findIndex(elem => elem.accion === 'notificar') !== -1) ? true : false;
        }
        return null;
    }
}
