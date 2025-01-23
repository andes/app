import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PlexHelpComponent } from '@andes/plex/src/lib/help/help.component';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { Unsubscribe } from '@andes/shared';
import { Location } from '@angular/common';
import { Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, concatWith, map, switchMap } from 'rxjs';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { IMotivoAcceso } from 'src/app/modules/rup/interfaces/IMotivoAcceso';
import { PacienteRestringidoPipe } from 'src/app/pipes/pacienteRestringido.pipe';
import { MotivosHudsService } from 'src/app/services/motivosHuds.service';
import { RouterService } from 'src/app/services/router.service';
import { HUDSService } from '../../../modules/rup/services/huds.service';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { TurnoService } from '../../../services/turnos/turno.service';
import { ConstantesService } from 'src/app/services/constantes.service';
import { SnomedService } from 'src/app/apps/mitos';


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
    public showAuditar = false;
    public showReferir = false;
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
    public fechaDesde: Date = moment().startOf('day').toDate();
    public fechaHasta: Date = moment().startOf('day').toDate();
    public hoy: Date = moment().toDate();
    public pacienteEntrada: any;
    public pacienteSalida: any;
    public prestacionesDestinoEntrada = [];
    public prestacionesDestinoSalida = [];
    public mostrarMasOpcionesSalida = false;
    public mostrarMasOpcionesEntrada = false;
    public mostrarAlertaRangoDias = false;
    public conceptoAsociado = null;
    public listaConceptosAsociados = [];
    public seleccionado;
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
        private routerService: RouterService,
        private location: Location,
        private pacienteRestringido: PacienteRestringidoPipe,
        public motivosHudsService: MotivosHudsService,
        public constantesService: ConstantesService,
        public snomedService: SnomedService,
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
            this.fechaHasta = moment().startOf('day').toDate();
            this.fechaDesde = moment(this.fechaHasta).subtract(this.diasIntervalo, 'days').toDate();
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
        this.fechaDesde = solicitudes.fechaDesde || fechaHoy;
        this.fechaHasta = solicitudes.fechaHasta || fechaHoy;
    }

    resetFechas() {
        localStorage.setItem('solicitudes', JSON.stringify({}));
    }

    guardarFechas() {
        localStorage.setItem('solicitudes', JSON.stringify({ fechaDesde: this.fechaDesde, fechaHasta: this.fechaHasta }));
    }

    cambioFechaDesde() {
        const diferencia = moment(this.fechaHasta).diff(this.fechaDesde, 'days');

        if (this.fechaDesde && this.tipoSolicitud === 'entrada') {
            this.mostrarAlertaRangoDias = false;

            if (!this.fechaHasta || (diferencia < 0) || (Math.abs(diferencia) > this.diasIntervalo)) {
                this.fechaHasta = moment(this.fechaDesde).add(this.diasIntervalo, 'days').toDate();
                this.mostrarAlertaRangoDias = true;
            }
            this.cargarSolicitudes();
        }
    }

    cambioFechaHasta() {
        const diferencia = moment(this.fechaHasta).diff(this.fechaDesde, 'days');

        if (this.fechaHasta && this.tipoSolicitud === 'entrada') {
            this.mostrarAlertaRangoDias = false;

            if (!this.fechaDesde || (diferencia < 0) || (Math.abs(diferencia) > this.diasIntervalo)) {
                this.fechaDesde = moment(this.fechaHasta).subtract(this.diasIntervalo, 'days').toDate();
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
            this.activeTab = activeTab;
            this.tipoSolicitud = (this.activeTab === 0) ? 'entrada' : 'salida';
            this.cargarSolicitudes();
        }
    }

    closeSidebar() {
        const tableCols = (this.columnas as any)?.columns$.source._value;
        if (tableCols && !tableCols.some(col => col.key === 'paciente')) {
            tableCols.splice(1, 0, { key: 'paciente', label: 'Paciente' });
            this.showPacienteData = true;
        }
        this.showAuditar = false;
        this.showReferir = false;
        this.showSidebar = false;
        this.showDetalle = false;
        this.showNuevaSolicitud = false;
    }

    volver() {
        this.location.back();
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

            prestacion.seleccionada = true;
            this.prestacionSeleccionada = prestacion;
            if (prestacion?.solicitud?.turno) {
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

    verOpcionContrarreferida(prestacion) {


        if (prestacion.solicitud.historial.length > 2) {
            if (prestacion.solicitud.historial[prestacion.solicitud.historial.length - 2].organizacion.id === this.auth.organizacion.id) {
            }
            return (prestacion.solicitud.historial[prestacion.solicitud.historial.length - 2].organizacion.id === this.auth.organizacion.id);
        }
    }

    private setShowDetallesFlags() {
        this.showDetalle = true;
        this.showSidebar = true;
        this.showAuditar = false;
        this.showReferir = false;
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
                () => {
                    this.cargarSolicitudes();
                    this.plex.toast('success', 'Solicitud anulada exitosamente');
                }
            );
            this.observacionesAnular = '';
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

    referir(prestacion) {
        const arreColumns = this.columns.filter(col => col.key !== 'paciente');
        this.columns = arreColumns;
        this.prestacionSeleccionada = prestacion;
        this.showAuditar = false;
        this.showReferir = true;
        this.showSidebar = true;
        this.showDetalle = false;
        this.showNuevaSolicitud = false;
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
        this.closeSidebar();
        this.guardarFechas();
        this.prestacionSeleccionada = null;

        (this.tipoSolicitud === 'entrada' ? this.prestacionesEntrada : this.prestacionesSalida).length = 0;
        this.skip = 0;
        this.scrollEnd = false;
        this.loader = true;
        this.buscarSolicitudes();
    }

    getParams() {
        const params: any = {
            estados: [
                'auditoria',
                'pendiente',
                'validada',
                'ejecucion',
                'asignada',
                'referir'
            ]
        };
        if (this.tipoSolicitud === 'entrada') {
            if (!this.check) {
                params['solicitudDesde'] = this.fechaDesde;
                params['solicitudHasta'] = this.fechaHasta;
                params['ordenFechaDesc'] = true;
            } else {
                params['solicitudDesdeActualizacion'] = this.fechaDesde;
                params['solicitudHastaActualizacion'] = this.fechaHasta;
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
                    params.estados = params.estados.filter(e => e !== 'validada' && e !== 'ejecucion');
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
            if (this.conceptoAsociado) {
                params['conceptoAsociado'] = this.conceptoAsociado;
            }
        } else {
            params.estados.push('rechazada');
            if (!this.check) {
                params['solicitudDesde'] = this.fechaDesde;
                params['solicitudHasta'] = this.fechaHasta;
                params['ordenFechaDesc'] = true;
            } else {
                params['solicitudDesdeActualizacion'] = this.fechaDesde;
                params['solicitudHastaActualizacion'] = this.fechaHasta;
                params['ordenFechaDescAct'] = true;
            }
            if (this.asignadas) {
                params['idProfesionalOrigen'] = this.auth.profesional;
            }
            if (this.estadoSalida) {
                if (this.estadoSalida.id === 'turnoDado') {
                    params['tieneTurno'] = true;
                    params.estados = params.estados.filter(e => e !== 'validada' && e !== 'ejecucion');
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
            if (this.conceptoAsociado) {
                params['conceptoAsociado'] = this.conceptoAsociado;
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
            if (this.organizacionesOrigen?.length) {
                params.organizacionOrigen = this.organizacionesOrigen.map(o => o.id);
            }
        } else {
            // Si es bandeja de entrada, por defecto la organización origen es la propia
            params.organizacionOrigen = this.auth.organizacion.id;
            if (this.organizacionesDestino?.length) {
                params.organizacion = this.organizacionesDestino.map(o => o.id);
            }
        }
    }

    esPacienteRestringido(paciente) {
        return this.pacienteRestringido.transform(paciente);
    }

    @Unsubscribe()
    buscarSolicitudes() {
        return this.servicioPrestacion.getSolicitudes(this.getParams())
            .pipe(map((resultado) => resultado.filter((solicitud) => !this.esPacienteRestringido(solicitud.paciente))))
            .subscribe(resultado => {
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
                this.cargarConceptosAsociados();
            });
    }

    verFechaDateTimeEntrada() {
        return (this.asignadas && this.tipoSolicitud === 'entrada' && !this.actualizacion);
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

                    if (event.status === 2) {
                        patch.organizacion = event.organizacionContrarreferida;
                    }

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

    returnReferir(event) {
        this.showAuditar = false;
        this.showReferir = false;
        this.showSidebar = false;
        this.columns.splice(1, 0, { key: 'paciente', label: 'Paciente' });
        if (event.status !== false) {
            if (event?.status !== this.prestacionSeleccionada.estados && this.prestacionSeleccionada.estados?.length) {
                const patch = {
                    op: 'referir',
                    estado: 'referir',
                    observaciones: event.observaciones,
                    organizacion: event.organizacion,
                    profesional: event.profesional,
                    tipoPrestacion: event.prestacion
                };

                this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch).subscribe(() => {
                    this.cargarSolicitudes();
                });
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

    preAccesoHuds(motivoAccesoHuds: IMotivoAcceso | string) {
        const motivo = (typeof motivoAccesoHuds !== 'string') ? motivoAccesoHuds?.motivo : motivoAccesoHuds;

        if (motivo) {
            if (!this.accesoHudsPaciente && !this.accesoHudsPrestacion && this.routeToParams && this.routeToParams[0] === 'huds') {
                // Se esta accediendo a 'HUDS DE UN PACIENTE'
                window.sessionStorage.setItem('motivoAccesoHuds', motivo);
            } else {
                if (this.accesoHudsPaciente) {
                    const paramsToken = {
                        usuario: this.auth.usuario,
                        organizacion: this.auth.organizacion,
                        paciente: this.accesoHudsPaciente,
                        motivo,
                        profesional: this.auth.profesional,
                        idTurno: this.accesoHudsTurno,
                        idPrestacion: this.accesoHudsPrestacion,
                        detalleMotivo: (typeof motivoAccesoHuds !== 'string') ? motivoAccesoHuds.textoObservacion : null

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
        this.showAuditar = false;
        this.showReferir = false;
        this.showSidebar = true;
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
        this.actualizacion = !this.actualizacion;
        this.loader = true;
        this.cargarSolicitudes();
    }

    actualizarFechas() {
        if (this.tipoSolicitud === 'entrada') {
            this.prestacionesEntrada = [];
            this.fechaDesde = moment().startOf('day').toDate();
            this.fechaHasta = moment().startOf('day').toDate();
        } else {
            this.prestacionesSalida = [];
            this.fechaDesde = moment().startOf('day').toDate();
            this.fechaHasta = moment().startOf('day').toDate();
        }
    }

    // --------------------- ACCION DE BOTONES -----------------------------

    onConfirmarIniciarPrestacion() {
        // token HUDS
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
        this.motivosHudsService.getMotivo('rup-inicio-prestacion').pipe(
            switchMap(motivoH => {
                const paramsToken = {
                    usuario: this.auth.usuario,
                    organizacion: this.auth.organizacion,
                    paciente: this.prestacionSeleccionada.paciente,
                    motivo: motivoH[0].key,
                    profesional: this.auth.profesional,
                    idTurno: null,
                    idPrestacion: this.prestacionSeleccionada.solicitud.tipoPrestacion.id
                };
                return this.hudsService.generateHudsToken(paramsToken);
            }),
            concatWith(this.servicioPrestacion.patch(this.prestacionSeleccionada.id, patch)),
            catchError(err => this.plex.info('danger', 'La prestación no pudo ser iniciada. ' + err))
        ).subscribe(() => this.router.navigate(['/rup/ejecucion', this.prestacionSeleccionada.id]));
    }

    volverAuditoria() {
        this.plex.confirm('¿Realmente quiere volver al estado Auditoría?', 'Atención').then(confirmar => {
            if (confirmar) {
                const cambioEstado: any = {
                    op: 'estadoPush',
                    estado: { tipo: 'auditoria', observaciones: 'La solicitud pasó a estado Auditoría' }
                };
                this.servicioPrestacion.patch(this.prestacionSeleccionada.id, cambioEstado).subscribe({
                    complete: () => {
                        this.plex.toast('info', 'Prestación nuevamente en Auditoría');
                        this.cargarSolicitudes();
                    },
                    error: () => this.plex.toast('danger', 'ERROR: No es posible cambiar el estado de la prestación')
                });
            }
        });
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
        this.accesoHudsPaciente = this.prestacionSeleccionada.paciente;
        this.motivosHudsService.getMotivo('continuidad').subscribe(motivoH => {
            this.preAccesoHuds(motivoH[0].key);
        });
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

    setConceptoAsociado(event) {
        this.conceptoAsociado = event.value?.id || null;
        this.cargarSolicitudes();
    }

    cargarConceptosAsociados() {
        this.constantesService.search({ source: 'solicitud:conceptosAsociados' }).subscribe(async (constantes) => {
            const query = constantes[0].query;

            this.snomedService?.get({
                search: query
            }).subscribe((resultados) => {
                this.listaConceptosAsociados = resultados.map(concepto => ({ id: concepto.conceptId, nombre: concepto.term }));
            });
        });
    }
}
