import {
    Component,
    OnInit,
    HostBinding,
    NgModule,
    ViewContainerRef,
    ViewChild
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule
} from '@angular/forms';
import {
    Router
} from '@angular/router';
import {
    Auth
} from '@andes/auth';
import {
    Plex
} from '@andes/plex';
import {
    TipoPrestacionService
} from './../../../services/tipoPrestacion.service';
import {
    ProfesionalService
} from './../../../services/profesional.service';
import {
    EspacioFisicoService
} from './../../../services/turnos/espacio-fisico.service';
import {
    AgendaService
} from './../../../services/turnos/agenda.service';
import {
    IAgenda
} from './../../../interfaces/turnos/IAgenda';

import * as enumerado from './../enums';
import * as moment from 'moment';
import {
    enumToArray
} from '../../../utils/enums';
import { ITurno } from '../../../interfaces/turnos/ITurno';

@Component({
    selector: 'gestor-agendas',
    templateUrl: 'gestor-agendas.html',
    styleUrls: ['./gestor-agendas.scss']
})

export class GestorAgendasComponent implements OnInit {

    showReasignarTurnoAgendas: boolean;
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    private guardarAgendaPanel: ViewContainerRef;
    @ViewChild('guardarAgendaPanel') set setGuardarAgendaPanel(theElementRef: ViewContainerRef) {
        this.guardarAgendaPanel = theElementRef;
    }

    agendasSeleccionadas: IAgenda[] = [];
    turnosSeleccionados: ITurno[] = [];

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
    public showAgregarSobreturno = false;
    public showRevisionAgenda = false;
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
    public btnDarTurnos = false;
    public btnCrearAgendas = false;

    public permisos: any;
    public prestacionesPermisos = [];

    // Contador de turnos suspendidos por agenda, para mostrar notificaciones
    turnosSuspendidos: any[] = [];

    ag: IAgenda;
    // vistaAgenda: IAgenda;
    reasignar: IAgenda;
    editaAgenda: IAgenda;

    items: any[];

    constructor(public plex: Plex, private formBuilder: FormBuilder, public servicioPrestacion: TipoPrestacionService,
        public serviceProfesional: ProfesionalService, public servicioEspacioFisico: EspacioFisicoService,
        public serviceAgenda: AgendaService, private router: Router,
        public auth: Auth) { }

    ngOnInit() {
        this.permisos = this.auth.getPermissions('turnos:agenda:?').length > 0;
        this.autorizado = this.auth.getPermissions('turnos:agenda:?').length > 0;
        this.prestacionesPermisos = this.auth.getPermissions('turnos:planificarAgenda:prestacion:?');

        // Verificamos permisos globales para turnos, si no posee realiza redirect al home
        if (!this.autorizado) {
            this.redirect('inicio');
        };

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
            estado: ''
        };
        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
            this.parametros['tipoPrestaciones'] = this.prestacionesPermisos;
        }

        // Por defecto cargar/mostrar agendas de hoy
        this.hoy = true;
        this.loadAgendas();

        this.fechaDesde = new Date();
        this.fechaHasta = new Date();
        this.fechaDesde = moment(this.fechaDesde).startOf('day');
        this.fechaHasta = moment(this.fechaHasta).endOf('day');

        // Iniciamos la búsqueda
        this.parametros = {
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            organizacion: this.auth.organizacion._id
        };

    }

    refreshSelection(value, tipo) {
        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*' && this.prestaciones.length === 0) {
            this.parametros['tipoPrestaciones'] = this.prestacionesPermisos;
        }
        if (tipo === 'fechaDesde') {
            let fechaDesde = moment(this.fechaDesde).startOf('day');
            if (fechaDesde.isValid()) {
                this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
                this.parametros['organizacion'] = this.auth.organizacion._id;
            }
        }
        if (tipo === 'fechaHasta') {
            let fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaHasta.isValid()) {
                this.parametros['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
                this.parametros['organizacion'] = this.auth.organizacion._id;
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
            if (value.value !== null) {
                this.parametros['idProfesional'] = value.value.id;
            } else {
                this.parametros['idProfesional'] = '';
            }
        }
        if (tipo === 'espacioFisico') {
            if (value.value !== null) {
                this.parametros['espacioFisico'] = value.value.id;
            } else {
                this.parametros['espacioFisico'] = '';
            }
        }
        if (tipo === 'estado') {
            if (value.value !== null) {
                this.parametros['estado'] = value.value.id;
            } else {
                this.parametros['estado'] = '';
            }
        }

        // Completo params con la info que ya tengo
        this.getAgendas(this.parametros);
    };

    getAgendas(params: any) {
        this.serviceAgenda.get(params).subscribe(agendas => {
            this.turnosSuspendidos = [];
            agendas.forEach(agenda => {
                let count = 0;
                agenda.bloques.forEach(bloque => {
                    bloque.turnos.forEach(turno => {

                        // Cuenta la cantidad de turnos suspendidos (no reasignados) con paciente en cada agenda
                        if ((turno.paciente && turno.paciente.id) && ((turno.estado === 'suspendido') || (agenda.estado === 'suspendida')) && (!turno.reasignado || !turno.reasignado.siguiente)) {
                            count++;
                        }

                    });
                });
                this.turnosSuspendidos = [...this.turnosSuspendidos, {
                    count: count
                }];
            });

            this.hoy = false;
            this.agendas = agendas;

        }, err => {
            if (err) {
                console.log(err);
            }
        });
    }

    loadAgendas() {
        let fecha = moment().format();

        if (this.hoy) {
            this.fechaDesde = fecha;
            this.fechaHasta = fecha;
        }
        this.fechaDesde = moment(this.fechaDesde).startOf('day').toDate();
        this.fechaHasta = moment(this.fechaHasta).endOf('day').toDate();

        const params = {
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            organizacion: this.auth.organizacion._id,
            idTipoPrestacion: '',
            idProfesional: '',
            idEspacioFisico: ''
        };
        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
            params['tipoPrestaciones'] = this.prestacionesPermisos;
        }
        this.getAgendas(params);

    }

    agregarNotaAgenda() {
        this.showClonar = false;
        this.showDarTurnos = false;
        this.showEditarAgenda = false;
        this.showEditarAgendaPanel = false;
        this.showTurnos = false;
        this.showRevisionAgenda = false;
        this.showReasignarTurno = false;
        this.showReasignarTurnoAutomatico = false;
        this.showListadoTurnos = false;
        this.showAgregarNotaAgenda = true;
    }

    agregarSobreturno() {
        this.showGestorAgendas = false;
        this.showAgregarSobreturno = true;
    }

    cancelaAgregarNotaAgenda() {
        this.showTurnos = true;
        this.showAgregarNotaAgenda = false;
    }

    saveAgregarNotaAgenda() {
        this.loadAgendas();
        this.showTurnos = true;
        this.showAgregarNotaAgenda = false;
    }

    clonar() {
        this.showGestorAgendas = false;
        this.showClonar = true;
    }

    // vuelve al gestor luego de alguna operación y refresca la agenda modificada.
    volverAlGestor(agendModificada) {
        if (agendModificada.id) { // vuelve de dar sobreturno
            this.verAgenda(this.agendasSeleccionadas[0], false, null);
        }
        this.showGestorAgendas = true;
        this.showDarTurnos = false;
        this.showEditarAgenda = false;
        this.showInsertarAgenda = false;
        this.showAgregarNotaAgenda = false;
        this.showAgregarSobreturno = false;
        this.showClonar = false;
        this.showRevisionAgenda = false;
        this.showReasignarTurno = false;
        this.showReasignarTurnoAutomatico = false;
        this.showListadoTurnos = false;
        this.showCarpetas = false;
        this.loadAgendas();
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

        if (this.editaAgenda.estado === 'planificacion') {
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
        this.showRevisionAgenda = false;
        this.showReasignarTurno = false;
        this.showListadoTurnos = false;
        this.showReasignarTurnoAutomatico = false;
    }

    revisionAgenda(agenda) {
        this.showGestorAgendas = false;
        this.showRevisionAgenda = true;
    }

    loadPrestaciones(event) {
        if (this.prestacionesPermisos && this.prestacionesPermisos[0] !== '*') {
            this.servicioPrestacion.get({
                id: this.prestacionesPermisos
            }).subscribe(event.callback);
        } else {
            this.servicioPrestacion.get({
                turneable: 1
            }).subscribe(event.callback);
        }
    }

    loadProfesionales(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
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
            this.serviceAgenda.getById(agenda.id).subscribe(ag => {
                // Actualizo la agenda local
                agenda = ag;
                // Actualizo la agenda global (modelo)
                this.agenda = ag;
                if (this.showEditarAgendaPanel && agenda.estado !== 'publicada' && agenda.estado !== 'disponible' && agenda.estado !== 'planificacion') {
                    this.plex.info('danger', '', 'No es posible editar la agenda seleccionada.', 3000);
                    return;
                }

                if (!multiple) {
                    if (ag.estado === 'suspendida') {
                        this.showSuspendida = true; // Mostramos los pacientes y sus teléfonos de la agenda suspendida
                    }
                    this.agendasSeleccionadas = [];
                    this.agendasSeleccionadas = [...this.agendasSeleccionadas, ag];
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
                    this.showAgregarSobreturno = false;
                    this.showRevisionAgenda = false;
                    this.showTurnos = false;
                    this.showReasignarTurno = false;
                    this.showReasignarTurnoAutomatico = false;
                    this.showListadoTurnos = false;
                    this.showBotonesAgenda = true;

                    if (!this.hayAgendasSuspendidas() && !this.showSuspenderAgenda) {
                        this.showTurnos = true;
                    }
                    // if (this.hayAgendasSuspendidas() && this.showSuspenderAgenda) {
                    // this.showGestorAgendas = false;
                    // this.showReasignarTurnoAutomatico = true; -->funcion comentada queda fuera del release
                    //   this.showSuspenderTurnos = true;
                    // this.agendasSeleccionadas[0] = ag;
                    // } else {
                    //     this.showTurnos = true;
                    // }
                }

            });
        }
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

    darTurnos() {
        this.showGestorAgendas = false;
        this.showDarTurnos = true;
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
            this.showRevisionAgenda = false;
            this.showSuspenderAgenda = true;
        } else {
            this.showTurnos = false;
            this.showEditarAgenda = false;
            this.showEditarAgendaPanel = false;
            this.showAgregarNotaAgenda = false;
            this.showReasignarTurno = false;
            this.showReasignarTurnoAgendas = false;
            this.showReasignarTurnoAutomatico = false;
            this.showRevisionAgenda = false;
        }

        if (!this.showSuspenderAgenda) {
            let temporal = this.agendasSeleccionadas;
            this.loadAgendas();
            this.agendasSeleccionadas = temporal;
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

    cerrarSuspenderTurno() {
        this.showSuspenderAgenda = false;
        this.showSuspendida = false;
        this.showClonar = false;
        this.showDarTurnos = false;
        this.showEditarAgenda = false;
        this.showEditarAgendaPanel = false;
        this.showTurnos = false;
        this.showRevisionAgenda = false;
        this.showReasignarTurno = false;
        this.showReasignarTurnoAutomatico = true;
        this.showListadoTurnos = false;
        this.showAgregarNotaAgenda = false;
        this.loadAgendas();
    }

}
