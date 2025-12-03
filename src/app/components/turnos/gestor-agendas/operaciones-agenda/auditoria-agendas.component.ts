import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { BiQueriesComponent } from 'src/app/modules/visualizacion-informacion/components/bi-queries/bi-queries.component';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';
import { QueriesService } from 'src/app/services/query.service';
import { ITurno } from '../../../../interfaces/turnos/ITurno';
import { InstitucionService } from 'src/app/services/turnos/institucion.service';
import { enumToArray } from '../../../../utils/enums';
import { IAgenda } from '../../../../interfaces/turnos/IAgenda';
import { ProfesionalService } from 'src/app/services/profesional.service';
import { AgendaService } from 'src/app/services/turnos/agenda.service';
import { EspacioFisicoService } from 'src/app/services/turnos/espacio-fisico.service';
import * as enumerado from '../../enums';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgForm } from '@angular/forms';
import { ICodificacionPrestacion } from 'src/app/modules/rup/interfaces/ICodificacion';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { CodificacionService } from 'src/app/modules/rup/services/codificacion.service';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';

@Component({
    selector: 'auditoria-agendas',
    templateUrl: './auditoria-agendas.html'
})

export class AuditoriaAgendasComponent implements OnInit, OnDestroy {

    showReasignarTurnoAgendas: boolean;

    @ViewChild('formu', { static: false }) formu: NgForm;
    @ViewChildren(BiQueriesComponent) biQuery: QueryList<any>;

    agendasSeleccionadas: IAgenda[] = [];
    turnosSeleccionados: ITurno[] = [];
    private queryParams: any = localStorage.getItem('filtrosAuditoriaAgendas') ? JSON.parse(localStorage.getItem('filtrosAuditoriaAgendas')) : undefined;
    public tabIndex = 0;

    public showAuditoriaAgendas = true;
    public showTurnos = false;
    public showReasignarTurno = false;
    public showReasignarTurnoAutomatico = false;
    public showBotonesAgenda = false;
    public showClonar = false;
    public showDarTurnos = false;
    public showEditarAgenda = false;
    public showEditarAgendaPanel = false;
    public showInsertarAgenda = false;
    public showAgregarNotaAgenda = false;
    public showRevisionAgenda = false;
    public showRevisionFueraAgenda = false;
    public showListadoTurnos = false;
    public showCarpetas = false;
    public showSuspenderAgenda = false;
    public showSuspendida = false;
    public agendas: any = [];
    public agenda: any = {};
    public modelo: any = {};
    public hoy = false;
    public autorizado = false;
    public mostrarMasOpciones = false;
    public estadosAgenda = enumerado.EstadosAgendaAuditoria;
    public estadosAgendaArray = enumToArray(enumerado.EstadosAgendaAuditoria);
    public estadosFueraAgendaArray = enumToArray(enumerado.EstadosFueraAgenda);
    private estados = Object.keys(this.estadosAgenda);
    public auditadas = false;
    public fechaDesde: any;
    public fechaHasta: any;
    public prestaciones: any = [];
    public profesionales: any = [];
    public espacioFisico: any = [];
    public prestacionesFueraAgenda: ICodificacionPrestacion[];
    public prestacionSeleccionada: ICodificacionPrestacion;
    public prestacion: IPrestacion;
    public showReparo = false;
    public diagnosticos = [];
    public estado: any = [];
    public parametros;
    public soloLectura = false;
    public btnDarTurnos = false;
    public btnCrearAgendas = false;
    public permisos: any;
    public prestacionesPermisos = [];
    public puedeCrearAgenda: Boolean;
    public puedeRevisarAgendas: Boolean;
    private scrollEnd = false;
    public enableQueries = false;
    queries = [];
    public collapse = false;
    loader = true;

    // ultima request de profesionales que se almacena con el subscribe
    private lastRequestProf: Subscription;

    // ultima request de filtro fecha que se almacena con el subscribe
    private lastRequestFecha: Subscription;

    // Contador de turnos suspendidos por agenda, para mostrar notificaciones
    turnosSuspendidos: any[] = [];

    ag: IAgenda;
    // vistaAgenda: IAgenda;
    reasignar: IAgenda;
    editaAgenda: IAgenda;

    items: any[];

    // Permite :hover y click()
    @Input() selectable = true;

    // Muestra efecto de selección
    @Input() selected = false;

    public sortBy: string;
    public sortOrder = 'desc';
    botonera = true;

    public columns = [
        { key: 'seleccion', label: '' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'tipoPrestacion', label: 'Tipo Prestación' },
        { key: 'espacioFisico', label: 'Espacio Físico' },
        { key: 'acciones', label: '' }
    ];

    public columns2 = [
        { key: 'seleccion', label: '' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'paciente', label: 'Paciente' },
        { key: 'tipoPrestacion', label: 'Tipo Prestación' }
    ];

    constructor(
        public plex: Plex,
        private conceptoTurneablesService: ConceptosTurneablesService,
        public serviceProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService,
        public serviceAgenda: AgendaService,
        public serviceInstitucion: InstitucionService,
        private router: Router,
        public auth: Auth,
        private queryService: QueriesService,
        private breakpointObserver: BreakpointObserver,
        private prestacionesService: PrestacionesService,
        private serviceCodificacion: CodificacionService,
    ) { }

    /* limpiamos la request que se haya ejecutado */
    ngOnDestroy() {
        if (this.lastRequestProf) {
            this.lastRequestProf.unsubscribe();
        }
        if (this.lastRequestFecha) {
            this.lastRequestFecha.unsubscribe();
        }
    }

    ngOnInit() {
        this.soloLectura = this.auth.getPermissions('turnos:agenda:read:?').length > 0;
        this.permisos = this.auth.getPermissions('turnos:agenda:?').length > 0;
        this.autorizado = this.auth.getPermissions('turnos:agenda:?').length > 0;
        this.prestacionesPermisos = this.auth.getPermissions('turnos:planificarAgenda:prestacion:?');
        this.puedeCrearAgenda = this.auth.check('turnos:crearAgendas');
        this.puedeRevisarAgendas = this.auth.check('turnos:agenda:puedeRevision');

        // Verificamos permisos globales para turnos, si no posee realiza redirect al home
        if (!this.autorizado) {
            this.redirect('inicio');
        }

        // Verifica permisos para dar turnos
        this.btnDarTurnos = this.auth.getPermissions('turnos:darTurnos:prestacion:?').length > 0;
        // Verifica permisos para crear agenda
        this.btnCrearAgendas = this.auth.getPermissions('turnos:crearAgendas:?').length > 0;

        this.parametros = {
            fechaDesde: '',
            fechaHasta: '',
            organizacion: '',
            tipoPrestacion: '',
            idProfesional: '',
            espacioFisico: '',
            otroEspacioFisico: '',
            estado: '',
            estados: [],
            auditadas: false,
            nominalizada: true,
            skip: 0,
            limit: 15
        };
        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
            this.parametros['tipoPrestaciones'] = [...this.prestacionesPermisos];
        }

        // Si hay queryParams se setea 'parametros' para volver a la Auditoria con los mismos filtros
        if (this.queryParams) {
            this.parametros = this.queryParams;
            this.parametros.skip = 0;
            this.parametros.limit = 15;
            this.fechaDesde = moment(this.parametros.fechaDesde).startOf('day');
            this.fechaHasta = moment(this.parametros.fechaHasta).endOf('day');

            if (this.parametros.tipoPrestacion) {
                this.conceptoTurneablesService.search({ conceptId: this.parametros.tipoPrestacion }).subscribe(rta => {
                    this.prestaciones = rta;
                });
            }
            if (this.parametros.espacioFisico || this.parametros.idProfesional || this.parametros.estado) {
                this.mostrarMasOpciones = true;
                if (this.parametros.idProfesional) {
                    this.serviceProfesional.get({ id: this.parametros.idProfesional }).subscribe(rta => {
                        this.profesionales = rta[0];
                    });
                }
                if (this.parametros.espacioFisico) {
                    this.servicioEspacioFisico.getById(this.parametros.espacioFisico).subscribe(rta => {
                        this.modelo.espacioFisico = rta;
                    });
                }
                this.estado = this.estadosAgendaArray.find(e => e.id === this.queryParams.estado);
            }

            this.getAgendas();

            // Si hay idAgenda en localStorage llamo a verAgenda()
            if (localStorage.getItem('idAgenda')) {
                this.verAgenda({ id: localStorage.getItem('idAgenda') }, false, null);
            }

            localStorage.removeItem('filtrosAuditoriaAgendas');
            localStorage.removeItem('idAgenda');
        } else {
            // Por defecto cargar/mostrar agendas de hoy
            this.hoy = true;
            this.loadAgendas();
        }
    }

    // evento que ocurre al scrollear en una lista de agendas
    onScroll() {
        if (!this.scrollEnd) {
            this.getAgendas();
        }
    }

    refreshSelection(value, tipo) {
        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*' && this.prestaciones?.length === 0) {
            this.parametros['tipoPrestaciones'] = this.prestacionesPermisos;
        }
        if (tipo === 'fechaDesde') {
            const fechaDesde = moment(this.fechaDesde).startOf('day');
            if (fechaDesde.isValid()) {
                this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde : moment().format();
                this.parametros['organizacion'] = this.auth.organizacion.id;
                this.fechaHasta = moment(this.fechaHasta).startOf('day');
            }
        }
        if (tipo === 'fechaHasta') {
            const fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaHasta.isValid()) {
                this.parametros['fechaHasta'] = fechaHasta.isValid() ? fechaHasta : moment().format();
                this.parametros['organizacion'] = this.auth.organizacion.id;
                this.fechaDesde = moment(this.fechaDesde).startOf('day');
            }
        }
        if (tipo === 'prestaciones') {
            if (value.value !== null) {
                this.parametros['tipoPrestacion'] = value.value.map(tp => tp.conceptId);
                delete this.parametros['tipoPrestaciones'];
            } else {
                this.parametros['tipoPrestacion'] = '';
            }
        }
        if (tipo === 'profesionales') {
            if (value.value) {
                this.parametros['idProfesional'] = value.value.id;
            } else {
                this.parametros['idProfesional'] = '';
            }
        }
        if (tipo === 'espacioFisico') {
            if (value.value !== null) {
                if (value.value.organizacion) {
                    this.parametros['espacioFisico'] = value.value.id;
                } else {
                    this.parametros['otroEspacioFisico'] = value.value.id;
                }
            } else {
                this.parametros['espacioFisico'] = '';
                this.parametros['otroEspacioFisico'] = '';
            }
        }
        if (tipo === 'estado') {
            if (value.value !== null) {
                this.parametros['estado'] = value.value.id;
                this.parametros['estados'] = [];
            } else {
                this.parametros['estado'] = '';
                this.parametros['estados'] = this.estados;
            }
        }
        if (tipo = 'auditadas') {
            this.parametros.auditadas = this.auditadas;
        }
        // cada vez que se modifican los filtros seteamos el skip en 0
        this.loader = true;
        if (this.tabIndex === 0) {
            this.parametros.skip = 0;
            this.scrollEnd = false;
            this.getAgendas();
        } else {
            this.getFueraAgenda();
        }
    }

    getAgendas() {
        if (this.lastRequestFecha) {
            this.lastRequestFecha.unsubscribe();
        }
        // si es una nueva busqueda ...
        if (this.parametros.skip === 0) {
            this.agendas = [];
            this.turnosSuspendidos = [];
        }

        this.lastRequestFecha = this.serviceAgenda.get(this.parametros).subscribe((agendas: any) => {
            agendas.forEach(agenda => {
                let count = 0;
                agenda.bloques.forEach(bloque => {
                    bloque.turnos.forEach(turno => {
                        // Cuenta la cantidad de turnos suspendidos (no reasignados) con paciente en cada agenda
                        if ((turno.paciente && turno.paciente.id) && ((turno.estado === 'suspendido') || (agenda.estado === 'suspendida'))
                            && (!turno.reasignado || !turno.reasignado.siguiente)) {
                            count++;
                        }
                    });
                });
                this.turnosSuspendidos = [...this.turnosSuspendidos, {
                    count: count
                }];
                this.agendas.push(agenda);
            });

            this.loader = false;
            this.hoy = false;
            this.parametros.skip = this.agendas.length;
            // si vienen menos agendas que la cantidad límite significa que ya se cargaron todas
            if (!agendas.length || agendas.length < this.parametros.limit) {
                this.scrollEnd = true;
            }

        }, err => this.loader = false
        );
    }

    loadAgendas() {
        const fecha = moment().format();

        if (this.hoy) {
            this.fechaDesde = fecha;
            this.fechaHasta = fecha;
        }
        this.fechaDesde = moment(this.fechaDesde).startOf('day');
        this.fechaHasta = moment(this.fechaHasta).endOf('day');
        this.parametros.fechaDesde = this.fechaDesde;
        this.parametros.fechaHasta = this.fechaHasta;
        this.parametros.organizacion = this.auth.organizacion.id;
        this.parametros.estados = this.estados;
        this.parametros.skip = 0;

        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
            this.parametros['tipoPrestaciones'] = this.prestacionesPermisos;
        }
        this.getAgendas();
    }

    getFueraAgenda() {
        this.loader = true;
        this.serviceCodificacion.get(this.parametros).subscribe(datos => {
            this.prestacionesFueraAgenda = datos;
        });
        // this.prestacionSeleccionada = null;
        this.loader = false;
    }

    cerrarFueraAgenda() {
        this.prestacionSeleccionada = null;
        this.showRevisionFueraAgenda = false;
    }

    seleccionarPrestacion(prestacion: ICodificacionPrestacion) {
        if (prestacion === this.prestacionSeleccionada) {
            this.prestacionSeleccionada = null;
            this.showRevisionFueraAgenda = false;
        } else {
            this.prestacionSeleccionada = prestacion;
            this.diagnosticos = [];
            this.showReparo = false;
            if (prestacion.diagnostico.codificaciones && prestacion.diagnostico.codificaciones.length) {
                this.diagnosticos = this.diagnosticos.concat(prestacion.diagnostico.codificaciones);
            }
            this.enableQueries = false;
            this.showRevisionAgenda = false;
            this.showRevisionFueraAgenda = true;
        }
    }

    agregarSobreturno(agenda) {
        localStorage.setItem('filtrosAuditoriaAgendas', JSON.stringify(this.parametros));
        localStorage.setItem('idAgenda', agenda._id);
        this.router.navigate(['citas/sobreturnos', agenda._id]);
    }

    saveAgregarNotaAgenda() {
        if (this.parametros) {
            this.getAgendas();
        } else {
            this.loadAgendas();
        }
        this.showTurnos = true;
        this.showAgregarNotaAgenda = false;
    }

    clonar() {
        if (this.lastRequestFecha) {
            this.lastRequestFecha.unsubscribe();
        }
        this.showAuditoriaAgendas = false;
        this.showClonar = true;
    }

    // vuelve a la Auditoria luego de alguna operación y refresca la agenda modificada.
    volverAlaAuditoria(agendaModificada) {
        this.agendasSeleccionadas = [];
        if (agendaModificada && agendaModificada.id) {
            this.verAgenda(this.agendasSeleccionadas[0], false, null);
        }
        this.showAuditoriaAgendas = true;
        this.showDarTurnos = false;
        this.showEditarAgenda = false;
        this.showInsertarAgenda = false;
        this.showAgregarNotaAgenda = false;
        this.showClonar = false;
        this.showRevisionFueraAgenda = false;
        this.showReasignarTurno = false;
        this.showReasignarTurnoAutomatico = false;
        this.showListadoTurnos = false;
        this.showCarpetas = false;
        if (this.parametros) {
            this.parametros.skip = 0;
            this.parametros.limit = 15;
        }
        if (this.tabIndex === 0) {
            this.getAgendas();
        } else {
            this.loadAgendas();
        }
    }

    reasignaTurno(reasTurno) {
        this.reasignar = reasTurno;
        this.showAuditoriaAgendas = false;
        this.showDarTurnos = true;
    }

    showVistaTurnos(showTurnos: boolean) {
        this.showTurnos = showTurnos;
        this.showEditarAgendaPanel = false;
        this.showAgregarNotaAgenda = false;
    }

    insertarAgenda() {
        this.showInsertarAgenda = true;
        this.showAuditoriaAgendas = false;
    }

    editarAgenda(agendaSeleccionada) {
        this.editaAgenda = agendaSeleccionada;

        this.serviceAgenda.getById(this.editaAgenda.id).subscribe((agenda: any) => {
            if (agenda.estado === this.editaAgenda.estado) {
                if (this.editaAgenda.estado === 'planificacion' && !this.editaAgenda.dinamica) {
                    this.showEditarAgenda = true;
                    this.showAuditoriaAgendas = false;
                    this.showEditarAgendaPanel = false;
                    this.showTurnos = true;
                } else {
                    this.showEditarAgenda = false;
                    this.showAuditoriaAgendas = true;
                    this.showEditarAgendaPanel = true;
                    this.showTurnos = false;
                    this.showSuspenderAgenda = false;
                }
                this.showAgregarNotaAgenda = false;
                this.showRevisionFueraAgenda = false;
                this.showReasignarTurno = false;
                this.showListadoTurnos = false;
                this.showReasignarTurnoAutomatico = false;
            } else {
                this.plex.info('warning',
                    'Otro usuario ha modificado el estado de la Agenda seleccionada y la misma ya no es editable.',
                    'No se puede editar la Agenda');
                this.actualizarAuditoria(agenda.estado);
            }
        });
    }

    revisionAgenda() {
        this.showTurnos = false;
        this.showDarTurnos = false;
        this.showReasignarTurno = false;
        this.showReasignarTurnoAgendas = false;
        this.showListadoTurnos = false;
        this.showEditarAgendaPanel = false;
        this.showCarpetas = false;
        this.showEditarAgenda = false;
        this.showEditarAgendaPanel = false;
        this.showInsertarAgenda = false;
        this.showAgregarNotaAgenda = false;
        this.showClonar = false;
        this.showRevisionFueraAgenda = false;
        this.showReasignarTurnoAutomatico = false;
        this.showRevisionAgenda = true;
    }

    loadProfesionales(event) {
        if (event.query && event.query !== '' && event.query.length > 2) {
            // cancelamos ultimo request
            if (this.lastRequestProf) {
                this.lastRequestProf.unsubscribe();
            }
            const query = {
                nombreCompleto: event.query
            };
            this.lastRequestProf = this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            // cancelamos ultimo request
            if (this.lastRequestProf) {
                this.lastRequestProf.unsubscribe();
            }
            event.callback([]);
        }
    }

    loadEdificios(event) {
        if (event.query) {
            const query = {
                edificio: event.query,
                organizacion: this.auth.organizacion.id
            };
            this.servicioEspacioFisico.get(query).subscribe(listaEdificios => {
                event.callback(listaEdificios);
            });
        } else {
            event.callback(this.modelo.edificios || []);
        }
    }

    loadEspacios(event) {

        let listaEspaciosFisicos = [];
        if (event.query) {
            const query = {
                nombre: event.query,
                organizacion: this.auth.organizacion.id
            };
            this.servicioEspacioFisico.get(query).subscribe(resultado => {
                if (this.modelo.espacioFisico) {
                    listaEspaciosFisicos = resultado ? this.modelo.espacioFisico.concat(resultado) : this.modelo.espacioFisico;
                } else {
                    listaEspaciosFisicos = resultado;
                }
                event.callback(listaEspaciosFisicos);
            });
            // Para que el filtro muestre las instituciones
            this.serviceInstitucion.get({ search: '^' + query.nombre }).subscribe(resultado => {
                if (this.modelo.espacioFisico) {
                    listaEspaciosFisicos = resultado ? this.modelo.espacioFisico.concat(resultado) : this.modelo.espacioFisico;
                } else {
                    listaEspaciosFisicos = resultado;
                }
                event.callback(listaEspaciosFisicos);
            });
        } else {
            event.callback(this.modelo.espacioFisico || []);
        }
    }

    verAgenda(agenda, multiple, e) {

        // Si se presionó el boton suspender, no se muestran otras agendas hasta que se confirme o cancele la acción.
        if (!this.showSuspenderAgenda) {
            this.enableQueries = false;
            this.showBotonesAgenda = false;
            this.showTurnos = false;
            this.showSuspendida = false;
            this.showRevisionAgenda = false;
            if (agenda && agenda.id) {
                this.serviceAgenda.getById(agenda.id).subscribe(ag => {
                    // Actualizo la agenda local
                    agenda = ag;

                    // Actualizo la agenda global (modelo)
                    this.agenda = ag;

                    // Compruebo si la agenda es editable
                    if (this.showEditarAgendaPanel && agenda.estado !== 'publicada' && agenda.estado !== 'disponible' && agenda.estado !== 'planificacion') {
                        this.showEditarAgendaPanel = false;
                        this.showTurnos = true;
                        return;
                    }

                    if (!multiple) {
                        this.onSeleccionAgendaNoMultiple(ag);
                    } else {
                        const index = this.indexSeleccionado(agenda);
                        this.agendasSeleccionadas = [...this.agendasSeleccionadas, ag];
                    }

                    this.setColorEstadoAgenda(agenda);

                    if (this.showEditarAgendaPanel === false) {
                        // Reseteo el panel de la derecha
                        this.showEditarAgendaPanel = false;
                        this.showAgregarNotaAgenda = false;
                        this.showTurnos = false;
                        this.showReasignarTurno = false;
                        this.showReasignarTurnoAutomatico = false;
                        this.showListadoTurnos = false;
                        this.showBotonesAgenda = true;
                        this.showRevisionAgenda = true;
                        if (!this.hayAgendasSuspendidas() && !this.showSuspenderAgenda) {
                            this.showTurnos = true;
                        }
                    }
                });
            }
        }
    }

    onSeleccionAgendaNoMultiple(ag) {
        if (ag && ag.estado && ag.estado === 'suspendida') {
            this.showSuspendida = true; // Mostramos los pacientes y sus teléfonos de la agenda suspendida
        }
        if (this.indexSeleccionado(ag) >= 0) {
            this.agendasSeleccionadas = [];
        } else {
            this.agendasSeleccionadas = [ag];
        }
    }

    hayAgendasSuspendidas() {
        return this.agendasSeleccionadas.filter((x) => {
            return x.estado === 'suspendida';
        }).length > 0;
    }

    indexSeleccionado(agenda: any) {
        return this.agendasSeleccionadas.findIndex(x => x.id === agenda._id);
    }

    fueraAgendaSeleccionada(prestacion) {
        if (this.prestacionSeleccionada) {
            return prestacion === this.prestacionSeleccionada;
        }
        return false;
    }

    setColorEstadoAgenda(agenda) {
        if (agenda.estado === 'suspendida') {
            agenda.agendaSeleccionadaColor = 'danger';
        } else {
            agenda.agendaSeleccionadaColor = 'success';
        }
    }

    suspensionAvisada(agenda: any) {
        if (agenda.avisos) {
            return agenda.avisos.findIndex(item => item.estado === 'suspende') >= 0;
        }
        return false;
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    AuditoriaAgendas() {
        this.showAuditoriaAgendas = false;
    }

    actualizarEstado(estado) {

        switch (estado) {
            case 'publicada':
                this.plex.confirm('¿Publicar Agenda?').then((confirmado) => {
                    if (!confirmado) {
                        return false;
                    } else {
                        this.confirmarEstado(estado);
                    }
                });
                break;
            case 'suspendida':
                this.actualizarAuditoria(estado);
                break;
            case 'borrada':
                this.plex.confirm('¿Borrar Agenda?').then((confirmado) => {
                    if (!confirmado) {
                        return false;
                    } else {
                        this.confirmarEstado(estado);
                    }
                });
                break;
            default:
                this.confirmarEstado(estado);
                break;

        }
    }

    confirmarEstado(estado) {
        let alertCount = 0;
        this.agendasSeleccionadas.forEach((agenda, index) => {
            const patch = {
                'op': estado,
                'estado': estado
            };
            this.serviceAgenda.patch(agenda.id, patch).subscribe((resultado: any) => {
                // Si son múltiples, esperar a que todas se actualicen
                agenda.estado = resultado.estado;
                if (alertCount === 0) {
                    if (this.agendasSeleccionadas.length === 1) {
                        this.plex.toast('success', 'Información', 'La agenda cambió el estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                        this.actualizarAuditoria(estado);
                    } else {
                        this.plex.toast('success', 'Información', 'Las agendas cambiaron de estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                        this.actualizarAuditoria(estado);
                    }
                    alertCount++;
                }
            }, err => {
                if (err) {
                    this.plex.info('warning', 'Otro usuario ha modificado el estado de la agenda seleccionada, su Auditoria se ha actualizado', err);
                    this.actualizarAuditoria(estado);
                }
            });
        });
    }

    actualizarAuditoria(estado) {
        // Se suspende una agenda completa
        if (estado === 'suspendida') {
            this.showTurnos = false;
            this.showEditarAgenda = false;
            this.showEditarAgendaPanel = false;
            this.showAgregarNotaAgenda = false;
            this.showReasignarTurno = false;
            this.showReasignarTurnoAgendas = false;
            this.showReasignarTurnoAutomatico = false;
            this.showSuspenderAgenda = true;
        } else {
            this.showTurnos = false;
            this.showEditarAgenda = false;
            this.showEditarAgendaPanel = false;
            this.showAgregarNotaAgenda = false;
            this.showReasignarTurno = false;
            this.showReasignarTurnoAgendas = false;
            this.showReasignarTurnoAutomatico = false;
        }

        if (this.parametros) {
            this.parametros.skip = 0;
            this.scrollEnd = false;
            this.getAgendas();
        } else {
            this.loadAgendas();
        }
        if (!this.showSuspenderAgenda) {
            this.loadAgendas();
            this.agendasSeleccionadas.forEach((as) => {
                if (this.agendasSeleccionadas.length === 1) {
                    this.verAgenda(as, false, null);
                } else {
                    this.verAgenda(as, true, null);
                }
            });

            if (this.agendasSeleccionadas.length === 1) {
                this.showTurnos = true;
            }
        }
    }

    cerrarSuspenderTurno(agenda) {
        this.showSuspenderAgenda = false;
        this.showSuspendida = false;
        this.showClonar = false;
        this.showDarTurnos = false;
        this.showEditarAgenda = false;
        this.showEditarAgendaPanel = false;
        this.showTurnos = false;
        this.showReasignarTurno = false;
        this.showReasignarTurnoAutomatico = true;
        this.showListadoTurnos = false;
        this.showAgregarNotaAgenda = false;
        this.showRevisionAgenda = false;
        if (agenda) {
            this.actualizarAgenda(agenda);
            this.verAgenda(agenda, false, null);
            this.loadAgendas();
        }
    }

    actualizarAgenda(agenda) {
        const res = this.agendas.filter((element) => {
            return (element.id === agenda.id);
        });
        const indice = this.agendas.indexOf(res[0]);
        this.agendas[indice] = agenda;
    }

    auditarFueraAgenda() {
        this.showAuditoriaAgendas = false;
        this.showRevisionFueraAgenda = true;
    }

    changeCollapse(event) {
        this.collapse = event;
    }

    cambiarTab(index) {
        if (this.tabIndex !== index) {
            this.tabIndex = index;
            if (index === 0) {
                this.showRevisionAgenda = true;
                this.showRevisionFueraAgenda = false;
                this.getAgendas();
                this.cerrarSideBar();
            } else {
                this.showRevisionAgenda = false;
                this.showRevisionFueraAgenda = true;
                this.getFueraAgenda();
                this.cerrarSideBar();
            }
        }
    }

    textDocumento(documento) {
        return documento ? 'DNI:' + this.formatDoc(documento) : 'Sin documento (temporal)';
    }

    formatDoc(doc) {
        const last = doc.length;
        doc = doc.split('');
        doc.splice(last - 3, 0, '.');
        doc.splice(last - 6, 0, '.');
        return doc.join('');
    }

    registroProfesional(prestacion) {
        return prestacion?.paciente?.id && !prestacion?.diagnostico?.codificaciones[0]?.codificacionAuditoria?.codigo && prestacion?.diagnostico?.codificaciones[0]?.codificacionProfesional?.snomed?.term;
    }

    auditado(prestacion) {
        return prestacion?.paciente?.id && prestacion?.diagnostico?.codificaciones[0]?.codificacionAuditoria?.codigo;
    }

    volver() {
        this.router.navigate(['/inicio']);
    }

    cerrarSideBar() {
        this.agendasSeleccionadas = [];
        this.prestacionSeleccionada = null;
        this.showRevisionAgenda = false;
        this.showRevisionFueraAgenda = false;
    }

    isMobile() {
        return this.breakpointObserver.isMatched('(max-width: 599px)');
    }

}

