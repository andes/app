import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { ProfesionalService } from './../../../services/profesional.service';
import { EspacioFisicoService } from './../../../services/turnos/espacio-fisico.service';
import { AgendaService } from './../../../services/turnos/agenda.service';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import * as enumerado from './../enums';
import * as moment from 'moment';
import { enumToArray } from '../../../utils/enums';
import { ITurno } from '../../../interfaces/turnos/ITurno';
import { Subscription } from 'rxjs';
import { InstitucionService } from '../../../services/turnos/institucion.service';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';

@Component({
    selector: 'gestor-agendas',
    templateUrl: 'gestor-agendas.html',
    styleUrls: ['./gestor-agendas.scss']
})

export class GestorAgendasComponent implements OnInit, OnDestroy {

    showReasignarTurnoAgendas: boolean;

    private guardarAgendaPanel: ViewContainerRef;
    @ViewChild('guardarAgendaPanel', { static: false }) set setGuardarAgendaPanel(theElementRef: ViewContainerRef) {
        this.guardarAgendaPanel = theElementRef;
    }

    agendasSeleccionadas: IAgenda[] = [];
    turnosSeleccionados: ITurno[] = [];
    private queryParams: any = localStorage.getItem('filtrosGestorAgendas') ? JSON.parse(localStorage.getItem('filtrosGestorAgendas')) : undefined;

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

    constructor(
        public plex: Plex,
        private conceptoTurneablesService: ConceptosTurneablesService,
        public serviceProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService,
        public serviceAgenda: AgendaService,
        public serviceInstitucion: InstitucionService,
        private router: Router,
        public auth: Auth) { }

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
        this.puedeRevisarAgendas = this.auth.check('turnos:agenda:puedeRevisions');

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
            idTipoPrestacion: '',
            idProfesional: '',
            espacioFisico: '',
            otroEspacioFisico: '',
            estado: '',
            skip: 0,
            limit: 15
        };
        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
            this.parametros['tipoPrestaciones'] = this.prestacionesPermisos;
        }

        // Si hay queryParams se setea 'parametros' para volver al gestor con los mismos filtros
        if (this.queryParams) {
            this.parametros = this.queryParams;
            this.parametros.skip = 0;
            this.parametros.limit = 15;
            this.fechaDesde = moment(this.parametros.fechaDesde).startOf('day');
            this.fechaHasta = moment(this.parametros.fechaHasta).endOf('day');

            if (this.parametros.idTipoPrestacion) {
                this.conceptoTurneablesService.get(this.parametros.idTipoPrestacion).subscribe(rta => { this.prestaciones = rta; });
            }
            if (this.parametros.espacioFisico || this.parametros.idProfesional || this.parametros.estado) {
                this.mostrarMasOpciones = true;
                if (this.parametros.idProfesional) {
                    this.serviceProfesional.get({ id: this.parametros.idProfesional }).subscribe(rta => { this.profesionales = rta[0]; });
                }
                if (this.parametros.espacioFisico) {
                    this.servicioEspacioFisico.getById(this.parametros.espacioFisico).subscribe(rta => { this.modelo.espacioFisico = rta; });
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
        if (typeof value.value === 'undefined') {
            return null;
        }
        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*' && this.prestaciones.length === 0) {
            this.parametros['tipoPrestaciones'] = this.prestacionesPermisos;
        }
        if (tipo === 'fechaDesde') {
            let fechaDesde = moment(this.fechaDesde).startOf('day');
            if (fechaDesde.isValid()) {
                this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde : moment().format();
                this.parametros['organizacion'] = this.auth.organizacion.id;
                this.fechaHasta = moment(this.fechaHasta).startOf('day');
            }
        }
        if (tipo === 'fechaHasta') {
            let fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaHasta.isValid()) {
                this.parametros['fechaHasta'] = fechaHasta.isValid() ? fechaHasta : moment().format();
                this.parametros['organizacion'] = this.auth.organizacion.id;
                this.fechaDesde = moment(this.fechaDesde).startOf('day');
            }
        }
        if (tipo === 'prestaciones') {
            if (value.value !== null) {
                this.parametros['idTipoPrestacion'] = value.value.id;
                delete this.parametros['tipoPrestaciones'];
            } else {
                this.parametros['idTipoPrestacion'] = '';
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
        this.getAgendas();
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


            this.hoy = false;
            this.parametros.skip = this.agendas.length;

            // si vienen menos agendas que la cantidad límite significa que ya se cargaron todas
            if (!agendas.length || agendas.length < this.parametros.limit) {
                this.scrollEnd = true;
            }

        }, err => {
            if (err) {
            }
        });
    }

    loadAgendas() {
        let fecha = moment().format();

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
    }

    agregarSobreturno(agenda) {
        localStorage.setItem('filtrosGestorAgendas', JSON.stringify(this.parametros));
        localStorage.setItem('idAgenda', agenda._id);
        this.router.navigate(['citas/sobreturnos', agenda._id]);
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

    clonar() {
        if (this.lastRequestFecha) {
            this.lastRequestFecha.unsubscribe();
        }
        this.showGestorAgendas = false;
        this.showClonar = true;
    }

    // vuelve al gestor luego de alguna operación y refresca la agenda modificada.
    volverAlGestor(agendaModificada) {
        if (agendaModificada && agendaModificada.id) {
            this.verAgenda(this.agendasSeleccionadas[0], false, null);
        }
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

    insertarAgenda() {
        this.showInsertarAgenda = true;
        this.showGestorAgendas = false;
    }

    editarAgenda(agenda) {
        this.editaAgenda = agenda;
        if (this.editaAgenda.estado === 'planificacion' && !this.editaAgenda.dinamica) {
            this.showEditarAgenda = true;
            this.showGestorAgendas = false;
            this.showEditarAgendaPanel = false;
        } else {
            this.showGestorAgendas = true;
            this.showEditarAgendaPanel = true;
            this.showEditarAgenda = false;
            this.showTurnos = false;
        }
        this.showAgregarNotaAgenda = false;
        this.showRevisionFueraAgenda = false;
        this.showReasignarTurno = false;
        this.showListadoTurnos = false;
        this.showReasignarTurnoAutomatico = false;
    }

    revisionAgenda(agenda) {
        localStorage.setItem('filtrosGestorAgendas', JSON.stringify(this.parametros));
        localStorage.setItem('idAgenda', agenda._id);
        this.router.navigate(['citas/revision_agenda', agenda._id]);
    }

    loadProfesionales(event) {
        if (event.query && event.query !== '' && event.query.length > 2) {
            // cancelamos ultimo request
            if (this.lastRequestProf) {
                this.lastRequestProf.unsubscribe();
            }
            let query = {
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
            let query = {
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
            let query = {
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
            this.showBotonesAgenda = false;
            this.showTurnos = false;
            this.showSuspendida = false;
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
                        let index = this.estaSeleccionada(agenda);
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

    onSeleccionAgendaNoMultiple(ag) {
        if (ag && ag.estado && ag.estado === 'suspendida') {
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

    actualizarEstadoEmit(estado) {
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

    listarTurnos(agenda) {
        this.showGestorAgendas = false;
        this.showListadoTurnos = true;
    }

    listarCarpetas(agenda) {
        this.showGestorAgendas = false;
        this.showCarpetas = true;
    }

    // Devuelve la duración (HH:mm) de una agenda
    duracionAgenda(horaInicio, horaFin) {
        let horas = moment.duration(horaFin - horaInicio).hours();
        let minutos = moment.duration(horaFin - horaInicio).minutes();
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
        }
    }

    actualizarAgenda(agenda) {
        const res = this.agendas.filter(function (element) {
            return (element.id === agenda.id);
        });
        let indice = this.agendas.indexOf(res[0]);
        this.agendas[indice] = agenda;
    }

    auditarFueraAgenda() {
        this.showGestorAgendas = false;
        this.showRevisionFueraAgenda = true;
    }

}
