import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription, forkJoin, map } from 'rxjs';
import { BiQueriesComponent } from 'src/app/modules/visualizacion-informacion/components/bi-queries/bi-queries.component';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';
import { QueriesService } from 'src/app/services/query.service';
import { ITurno } from '../../../interfaces/turnos/ITurno';
import { InstitucionService } from '../../../services/turnos/institucion.service';
import { enumToArray } from '../../../utils/enums';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { ProfesionalService } from './../../../services/profesional.service';
import { AgendaService } from './../../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../../services/turnos/espacio-fisico.service';
import * as enumerado from './../enums';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgForm } from '@angular/forms';

import { CarpetaPacienteService } from 'src/app/core/mpi/services/carpeta-paciente.service';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { PacienteCacheService } from '../../../core/mpi/services/pacienteCache.service';
import { ObraSocialService } from '../../../services/obraSocial.service';



@Component({
    selector: 'gestor-agendas',
    templateUrl: 'gestor-agendas.html',
    styleUrls: ['./gestor-agendas.scss']
})

export class GestorAgendasComponent implements OnInit, OnDestroy {
    public pacientesSearch = false;
    public pacientes: any;
    public obraSocialPaciente: any[] = [];

    showReasignarTurnoAgendas: boolean;
    public showSobreturno = false;

    private guardarAgendaPanel: ViewContainerRef;
    public esEscaneado = false;
    public paciente: IPaciente;
    public loading = false;
    carpetaEfector: any;
    changeCarpeta: boolean;
    telefono: string;
    cambioTelefono: boolean;
    @ViewChild('guardarAgendaPanel', { static: false }) set setGuardarAgendaPanel(theElementRef: ViewContainerRef) {
        this.guardarAgendaPanel = theElementRef;
    }
    @ViewChild('formu', { static: false }) formu: NgForm;
    @ViewChildren(BiQueriesComponent) biQuery: QueryList<any>;
    agendasSeleccionadas: IAgenda[] = [];
    turnosSeleccionados: ITurno[] = [];
    private queryParams: any = localStorage.getItem('filtrosGestorAgendas') ? JSON.parse(localStorage.getItem('filtrosGestorAgendas')) : undefined;
    public showElegirSobreTurno = false;
    public showGestorAgendas = true;
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
    public showRevisionFueraAgenda = false;
    public showListadoTurnos = false;
    public showCarpetas = false;
    public showSuspenderAgenda = false;
    public showSuspendida = false;
    public disabledGuardar = false;
    public agendas: any = [];
    public agenda: any = {};
    public modelo: any = {};
    public hoy = false;
    public autorizado = false;
    public mostrarMasOpciones = false;
    public estadosAgenda = enumerado.EstadosAgenda;
    public estadosAgendaArray = enumToArray(enumerado.EstadosAgenda);
    public fechaDesde: any;
    public fechaHasta: any;
    public prestaciones: any = [];
    public profesionales: any = [];
    public espacioFisico: any = [];
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
        {
            key: 'seleccion',
            label: '',

        },
        {
            key: 'fecha',
            label: 'Fecha',
        },
        {
            key: 'tipoPrestacion',
            label: 'Tipo Prestación',
        },
        {
            key: 'espacioFisico',
            label: 'Espacio Físico',
        },
        {
            key: 'acciones',
            label: '',
        },
    ];

    constructor(
        private pacienteCache: PacienteCacheService,
        private servicePaciente: PacienteService,
        private serviceCarpetaPaciente: CarpetaPacienteService,
        public obraSocialService: ObraSocialService,
        public plex: Plex,
        private conceptoTurneablesService: ConceptosTurneablesService,
        public serviceProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService,
        public serviceAgenda: AgendaService,
        public serviceInstitucion: InstitucionService,
        private router: Router,
        public auth: Auth,
        private queryService: QueriesService,
        private breakpointObserver: BreakpointObserver
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
            skip: 0,
            limit: 15
        };
        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
            this.parametros['tipoPrestaciones'] = [...this.prestacionesPermisos];
        }

        // Si hay queryParams se setea 'parametros' para volver al gestor con los mismos filtros
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

            localStorage.removeItem('filtrosGestorAgendas');
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
        if (this.formu.invalid) {
            this.agendas = [];// retornar vacio
            return null;
        }
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
            if (value.value) {
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
            } else {
                this.parametros['estado'] = '';
            }
        }
        // cada vez que se modifican los filtros seteamos el skip en 0
        this.parametros.skip = 0;
        this.scrollEnd = false;
        this.loader = true;
        this.getAgendas();
    }

    actualizarSeleccionada(agendas) {
        agendas.forEach(nuevaAgenda => {
            if (this.agendasSeleccionadas && this.agendasSeleccionadas[0].id === nuevaAgenda.id) {
                this.agendasSeleccionadas[0] = nuevaAgenda;
            }
        });
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
                        if ((turno.paciente?.id) && ((turno.estado === 'suspendido') || (agenda.estado === 'suspendida'))
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

            if (this.agendasSeleccionadas[0]) {
                this.actualizarSeleccionada(agendas);
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
        this.parametros.skip = 0;

        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
            this.parametros['tipoPrestaciones'] = this.prestacionesPermisos;
        }
        this.getAgendas();
    }

    agregarNotaAgenda() {
        this.showClonar = false;
        this.showDarTurnos = false;
        this.showEditarAgenda = false;
        this.showEditarAgendaPanel = false;
        this.showTurnos = false;
        this.showRevisionFueraAgenda = false;
        this.showReasignarTurno = false;
        this.showReasignarTurnoAutomatico = false;
        this.showListadoTurnos = false;
        this.showAgregarNotaAgenda = true;
        this.showSuspenderAgenda = false;
        this.showSuspendida = false;
    }


    cancelaAgregarNotaAgenda() {
        this.showTurnos = true;
        this.showAgregarNotaAgenda = false;
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

    clonar(agenda) {
        if (this.lastRequestFecha) {
            this.lastRequestFecha.unsubscribe();
        }

        let prestaciones = '';

        const observables$ = agenda.tipoPrestaciones.map(prestacion =>
            this.conceptoTurneablesService.search({ ids: prestacion._id })
        );

        forkJoin(observables$).subscribe((resultados: any) => {
            const result = resultados.flat();
            result.forEach(concepto => {
                if (concepto.ambito && !concepto.ambito.includes('ambulatorio')) {
                    prestaciones += concepto.term + ', ';
                }
            });

            if (prestaciones === '') {
                this.showGestorAgendas = false;
                this.showClonar = true;
            } else {
                prestaciones = prestaciones.slice(0, -2);
                this.plex.info(
                    'warning',
                    `Una o más prestaciones (<b>${prestaciones}</b>) no están habilitadas para crear agendas.`
                );
            }
        });
    }

    // vuelve al gestor luego de alguna operación y refresca la agenda modificada.
    volverAlGestor(agendaModificada) {
        this.agendasSeleccionadas = [];
        if (agendaModificada && agendaModificada.id) {
            this.verAgenda(this.agendasSeleccionadas[0], false, null);
        }
        this.showSobreturno = false;
        this.showElegirSobreTurno = false;
        this.showGestorAgendas = true;
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
            this.getAgendas();
        } else {
            this.loadAgendas();
        }
    }

    reasignaTurno(reasTurno) {
        this.reasignar = reasTurno;
        this.showGestorAgendas = false;
        this.showDarTurnos = true;
    }

    showVistaTurnos(showTurnos: boolean) {
        this.showTurnos = showTurnos;
        this.showEditarAgendaPanel = false;
        this.showAgregarNotaAgenda = false;
    }

    setDisabledGuardar(haySolapamiento: boolean) {
        this.disabledGuardar = haySolapamiento;
    }

    insertarAgenda() {
        this.showInsertarAgenda = true;
        this.showGestorAgendas = false;
    }

    editarAgenda(agendaSeleccionada) {
        this.editaAgenda = agendaSeleccionada;

        this.serviceAgenda.getById(this.editaAgenda.id).subscribe((agenda: any) => {
            if (agenda.estado === this.editaAgenda.estado) {
                if (this.editaAgenda.estado === 'planificacion' && !this.editaAgenda.dinamica) {
                    this.showEditarAgenda = true;
                    this.showGestorAgendas = false;
                    this.showEditarAgendaPanel = false;
                    this.showTurnos = true;
                } else {
                    this.showEditarAgenda = false;
                    this.showGestorAgendas = true;
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
                this.actualizarGestor(agenda.estado);
            }
        });
    }

    revisionAgenda(agenda) {
        localStorage.setItem('filtrosGestorAgendas', JSON.stringify(this.parametros));
        localStorage.setItem('idAgenda', agenda._id);
        this.router.navigate(['citas/revision_agenda', agenda._id]);
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

        if (this.showElegirSobreTurno) {
            this.showSobreturno = false;
            this.showElegirSobreTurno = false;
        }

        if (this.showSobreturno) {
            this.showSobreturno = false;
        }
        // Si se presionó el boton suspender, no se muestran otras agendas hasta que se confirme o cancele la acción.
        if (!this.showSuspenderAgenda) {
            this.enableQueries = false;
            this.showBotonesAgenda = false;
            this.showTurnos = false;
            this.showSuspendida = false;
            this.showEditarAgendaPanel = false;
            if (agenda?.id) {
                this.serviceAgenda.getById(agenda.id).subscribe(ag => {
                    // Actualizo la agenda local
                    agenda = ag;

                    // Actualizo la agenda global (modelo)
                    this.agenda = ag;

                    // Compruebo si la agenda es editable
                    if (this.showEditarAgendaPanel && agenda.estado !== 'publicada' && agenda.estado !== 'disponible' && agenda.estado !== 'planificacion' && agenda.estado !== 'pendienteAsistencia') {
                        this.showEditarAgendaPanel = false;
                        this.showTurnos = true;
                        return;
                    }

                    if (!multiple) {
                        this.onSeleccionAgendaNoMultiple(ag);
                    } else {
                        const index = this.estaSeleccionada(agenda);
                        if (index >= 0) {
                            agenda.agendaSeleccionadaColor = 'success';
                            this.agendasSeleccionadas.splice(index, 1);
                            this.agendasSeleccionadas = [...this.agendasSeleccionadas];
                        } else {
                            this.agendasSeleccionadas = [...this.agendasSeleccionadas, ag];
                        }
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

                        if (!this.hayAgendasSuspendidas() && !this.showSuspenderAgenda) {
                            this.showTurnos = true;
                        }
                    }
                });
            }
        }
    }

    agregarSobreturno($event?: any) {
        this.pacientes = null;
        if ($event) { $event.stopPropagation(); }
        this.showSobreturno = true;
        this.showElegirSobreTurno = false;
    }

    onSeleccionAgendaNoMultiple(ag) {
        if (ag?.estado && ag.estado === 'suspendida') {
            this.showSuspendida = true; // Mostramos los pacientes y sus teléfonos de la agenda suspendida
        }
        this.agendasSeleccionadas = [];
        this.agendasSeleccionadas = [...this.agendasSeleccionadas, ag];
    }

    hayAgendasSuspendidas() {
        return this.agendasSeleccionadas.filter((x) => {
            return x.estado === 'suspendida';
        }).length > 0;
    }

    estaSeleccionada(agenda: any) {
        return this.agendasSeleccionadas.findIndex(x => x.id === agenda._id);
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

    gestorAgendas() {
        this.showGestorAgendas = false;
    }

    actualizarEstado(estado) {

        switch (estado) {
            case 'publicada':
                const existeAgendaDelPasado = this.agendasSeleccionadas.some(agenda => moment(agenda.horaInicio).isBefore(moment().startOf('day')));
                let mensaje = '';
                if (this.agendasSeleccionadas.length > 1 && existeAgendaDelPasado) {
                    mensaje = 'Una o varias agendas pasarán a estado Auditada. ¿Desea publicar de todas formas?';
                } else if (this.agendasSeleccionadas.length === 1 && existeAgendaDelPasado) {
                    mensaje = 'La agenda seleccionada pasará a estado Auditada. ¿Desea publicar de todas formas?';
                } else if (this.agendasSeleccionadas.length > 1) {
                    mensaje = '¿Publicar las siguientes agendas?';
                } else {
                    mensaje = '¿Publicar agenda?';
                }
                this.plex.confirm(mensaje).then((confirmado) => {
                    if (!confirmado) {
                        return false;
                    } else {
                        this.confirmarEstado(estado);
                    }
                });
                break;
            case 'suspendida':
                this.actualizarGestor(estado);
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
            if (estado === 'publicada' && moment(agenda.horaInicio).isBefore(moment().startOf('day'))) {
                estado = 'auditada';
            }
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
                        this.actualizarGestor(estado);
                    } else {
                        this.plex.toast('success', 'Información', 'Las agendas cambiaron de estado a ' + (estado !== 'prePausada' ? estado : agenda.prePausada));
                        this.actualizarGestor(estado);
                    }
                    alertCount++;
                }
            }, err => {
                if (err) {
                    this.plex.info('warning', 'Otro usuario ha modificado el estado de la agenda seleccionada, su gestor se ha actualizado', err);
                    this.actualizarGestor(estado);
                }
            });
        });
    }

    actualizarGestor(estado) {
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
            this.parametros.skip = 0;
            this.scrollEnd = false;
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

    reasignarTurnos() {
        this.showGestorAgendas = false;
        this.showReasignarTurno = true;
    }

    reasignarTurnosAgendas() {
        this.showReasignarTurnoAgendas = true;
    }

    listarTurnos() {
        this.showGestorAgendas = false;
        this.showListadoTurnos = true;
    }

    listarCarpetas() {
        this.showGestorAgendas = false;
        this.showCarpetas = true;
    }

    // Devuelve la duración (HH:mm) de una agenda
    duracionAgenda(horaInicio, horaFin) {
        const horas = moment.duration(horaFin - horaInicio).hours();
        const minutos = moment.duration(horaFin - horaInicio).minutes();
        return horas + (horas === 1 ? ' hora ' : ' horas ') + (minutos > 0 ? minutos + ' minutos' : '');
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
        this.showGestorAgendas = false;
        this.showRevisionFueraAgenda = true;
    }

    cargarPacientes() {
        this.enableQueries = true;
        const agenda = this.agendasSeleccionadas[0];
        agenda.tipoPrestaciones.forEach(p => {
            if (p.queries?.length) {
                this.queries = [...this.queries, ...p.queries];
            }
        });
    }

    asignarPacientesPorConsulta() {
        let query;
        const params = {};
        let invalidFormMsg;
        this.biQuery.forEach(item => {
            if (item.consultaSeleccionada) {
                query = item.consultaSeleccionada.nombre;
                item.argumentos.forEach(arg => {
                    const key = arg.key;
                    const value = item.argumentos[key];
                    if (arg.required && !value) {
                        invalidFormMsg = 'Debe completar los filtros obligatorios';
                    }
                    params[key] = value;
                });
            } else {
                invalidFormMsg = 'Debe seleccionar una lista de pacientes';
            }
        });

        if (invalidFormMsg) {
            this.plex.info('warning', invalidFormMsg, 'Atención');
        } else {
            this.queryService.getQuery(query, params).subscribe(res => {
                this.asignarTurnosBulk(res);
            });
        }
    }

    cerrarCargarPacientes() {
        this.enableQueries = false;
    }

    asignarTurnosBulk(inscripciones) {
        const pacientes = inscripciones.map(e => ({
            _id: e.idPaciente,
            id: e.idPaciente,
            nombre: e.nombre,
            apellido: e.apellido,
            documento: e.dni,
            fechaNacimiento: moment(e.fechaNacimiento, 'DD-MM-YYYY').toDate(),
            telefono: e.telefono,
            sexo: e.sexo,
            carpetaEfectores: []
        }));

        let turnos = [];
        this.agendasSeleccionadas[0].bloques.forEach(b => {
            const turnosDisponibles = b.turnos.filter(t => !t.paciente);
            turnos = [...turnos, ...turnosDisponibles];
        });

        let i = 0;
        let end = pacientes.length;
        if (end > turnos.length) {
            end = turnos.length;
        }
        while (i < end) {
            turnos[i].paciente = pacientes[i];
            turnos[i].tipoPrestacion = this.agendasSeleccionadas[0].bloques[0]?.tipoPrestaciones[0];
            turnos[i].estado = 'asignado';
            i++;
        }

        this.serviceAgenda.save(this.agendasSeleccionadas[0]).subscribe(res => {
            this.showTurnos = true;
            this.enableQueries = false;
            this.plex.toast('success', 'Asignación automática exitosa', '', 1000);
        });
    }

    changeCollapse(event) {
        this.collapse = event;
    }

    volver() {
        this.router.navigate(['/inicio']);
    }

    isMobile() {
        return this.breakpointObserver.isMatched('(max-width: 599px)');
    }



    onSearchEnd(pacientes: IPaciente[], scan: string) {
        this.loading = false;
        this.esEscaneado = scan?.length > 0;
        if (this.esEscaneado && pacientes.length === 1 && pacientes[0].id) {
            this.pacienteCache.setScanCode(scan);
            this.onSelect(pacientes[0]);
        } else if (this.esEscaneado && pacientes.length === 1 && (!pacientes[0].id || (pacientes[0].estado === 'temporal' && pacientes[0].scan))) {
            this.pacienteCache.setPaciente(pacientes[0]);
            this.pacienteCache.setScanCode(scan);
            this.router.navigate(['/apps/mpi/paciente/con-dni/sobreturno']); // abre paciente-cru
        } else {
            this.pacientes = pacientes;
        }
    }


    onSelect(paciente: any): void {
        // Si se seleccionó por error un paciente fallecido
        this.servicePaciente.checkFallecido(paciente);
        this.paciente = paciente;
        this.loadObraSocial(this.paciente);
        this.verificarTelefono(this.paciente);
        this.showElegirSobreTurno = true;
        this.servicePaciente.getById(paciente.id).subscribe(
            pacienteMPI => {
                this.paciente = pacienteMPI;
                this.obtenerCarpetaPaciente();
                this.pacientesSearch = false;
                this.loadObraSocial(this.paciente);
            });
    }
    obtenerCarpetaPaciente() {
        let indiceCarpeta = -1;
        if (this.paciente.carpetaEfectores.length > 0) {
            // Filtro por organizacion
            indiceCarpeta = this.paciente.carpetaEfectores.findIndex(x => x.organizacion.id === this.auth.organizacion.id);
            if (indiceCarpeta > -1) {
                this.carpetaEfector = this.paciente.carpetaEfectores[indiceCarpeta];
            }
        }
        if (indiceCarpeta === -1) {
            // Si no hay carpeta en el paciente MPI, buscamos la carpeta en colección carpetaPaciente, usando el nro. de documento
            this.serviceCarpetaPaciente.getNroCarpeta({ documento: this.paciente.documento, organizacion: this.auth.organizacion.id }).subscribe(carpeta => {
                if (carpeta.nroCarpeta) {
                    this.carpetaEfector.nroCarpeta = carpeta.nroCarpeta;
                    this.changeCarpeta = true;
                }
            });
        }
    }

    loadObraSocial(paciente) {
        // TODO: si es en colegio médico hay que buscar en el paciente
        if (!paciente || !paciente.documento) {
            return;
        }
        this.obraSocialService.getObrasSociales({ documento: paciente.documento, sexo: paciente.sexo }).subscribe(resultado => {
            if (resultado.length) {
                this.obraSocialPaciente = resultado.map((os: any) => {
                    let osPaciente;

                    if (os.nombre) {
                        osPaciente = {
                            'id': os.nombre,
                            'label': os.nombre
                        };
                    } else {
                        osPaciente = {
                            'id': os.financiador,
                            'label': os.financiador
                        };
                    }
                    return osPaciente;
                });
                this.modelo.obraSocial = this.obraSocialPaciente[0].label;
            }
            this.obraSocialPaciente.push({ 'id': 'prepaga', 'label': 'Prepaga' });
        });
    }

    verificarTelefono(paciente: IPaciente) {
        // se busca entre los contactos si tiene un celular
        this.telefono = '';
        this.cambioTelefono = false;
        if (paciente.contacto) {
            if (paciente.contacto.length > 0) {
                paciente.contacto.forEach((contacto) => {
                    if (contacto.tipo === 'celular') {
                        this.telefono = contacto.valor;
                    }
                });
            }
        }
    }

    habilitarProfesional() {
        this.router.navigate(['citas/prestaciones_habilitadas']);
    }
}

