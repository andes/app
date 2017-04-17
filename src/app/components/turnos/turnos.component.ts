import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { Plex } from '@andes/plex';
import { PacienteService } from './../../services/paciente.service';
import { SmsService } from './../../services/turnos/sms.service';
import { AgendaService } from '../../services/turnos/agenda.service';
import { ListaEsperaService } from '../../services/turnos/listaEspera.service';
import * as moment from 'moment';

@Component({
    selector: 'turnos',
    templateUrl: 'turnos.html'
})

export class TurnosComponent implements OnInit {

    /*Propiedades del PopOver para confirmar acciones en Turnos*/
    public titleLiberarTurno: String = 'Liberar Turno';
    public titleSuspenderTurno: String = 'Suspender Turno';
    public messageLiberarTurno: String = 'Está seguro que desea Liberar el Turno? </br> Un SMS se enviará automáticamente al paciente.';
    public messageSuspenderTurno: String = 'Está seguro que desea Suspender el Turno? </br> Un SMS se enviará automáticamente al paciente.';
    public confirmaLiberarTurno: Boolean = false;
    public confirmaSuspenderTurno: Boolean = false;
    public cancelClicked: Boolean = false;

    private _agenda: IAgenda;
    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
        this.turnosSeleccionados = [];
        this.cantSel = 0;

        for (let i = 0; i < this.agenda.bloques.length; i++) {
            this.turnos = this.agenda.bloques[i].turnos;
        }
        this.actualizarBotones();
    }
    get agenda(): any {
        return this._agenda;
    }

    @Input() reasturnos: IAgenda;

    @Output() reasignaTurno = new EventEmitter<boolean>();

    showTurnos: Boolean = true;
    showLiberarTurno: Boolean = false;
    showSuspenderTurno: Boolean = false;
    showAgregarNotaTurno: Boolean = false;

    smsEnviado: Boolean = false;
    smsLoader: Boolean = false;

    turnos = [];
    turnosSeleccionados: any[] = [];
    turno: ITurno;
    cantSel: number;
    todos: Boolean = false;
    reasignar: any = {};

    bloques = [];

    // Contiene el cálculo de la visualización de botones
    botones: any = {};

    constructor(public plex: Plex, public smsService: SmsService, public serviceAgenda: AgendaService, public listaEsperaService: ListaEsperaService) { }


    ngOnInit() {
        this.turnosSeleccionados = [];
        this.actualizarBotones();
    }

    seleccionarTurno(turno, multiple = false) {

        if (!multiple) {
            this.turnosSeleccionados = [];
            this.turnosSeleccionados = [...this.turnosSeleccionados, turno];
        } else {
            if (this.turnosSeleccionados.find(x => x.id === turno._id)) {
                this.turnosSeleccionados.splice(this.turnosSeleccionados.indexOf(turno), 1);
                this.turnosSeleccionados = [... this.turnosSeleccionados];
            } else {
                this.turnosSeleccionados = [... this.turnosSeleccionados, turno];
            }
        }


        this.turnosSeleccionados.sort((a, b) => {
            return (a.horaInicio.getTime() > b.horaInicio.getTime() ? 1 : (b.horaInicio.getTime() > a.horaInicio.getTime() ? -1 : 0));
        });


        if (this.turnosSeleccionados.length < this.turnos.length) {
            this.todos = false;
        }

        if (this.turnosSeleccionados.length === this.turnos.length) {
            this.todos = true;
        }

        this.cantSel = this.turnosSeleccionados.length;

        this.actualizarBotones();

    }

    estaSeleccionado(turno: any) {
        return this.turnosSeleccionados.indexOf(turno) >= 0;
    }

    seleccionarTodos() {

        this.turnosSeleccionados = [];

        for (let a = 0; a < this.agenda.bloques.length; a++) {
            for (let b = 0; b < this.agenda.bloques[a].turnos.length; b++) {
                if (!this.todos) {
                    this.agenda.bloques[a].turnos[b].checked = true;
                    this.turnosSeleccionados = [...this.turnosSeleccionados, this.agenda.bloques[a].turnos[b]];
                } else {
                    this.agenda.bloques[a].turnos[b].checked = false;
                }
            }
        }

        this.todos = !this.todos;
        this.cantSel = this.turnosSeleccionados.length;
        this.actualizarBotones();
    }

    agendaNoSuspendida() {
        return this.agenda.estado !== 'Suspendida';
    }

    tienenPacientes() {
        return this.turnosSeleccionados.filter((turno) => {
            return turno.paciente;
        }).length === this.turnosSeleccionados.length;
    }

    tienenAsistencia() {
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            if (this.turnosSeleccionados[x].asistencia !== true) {
                return false;
            }
        };
        return true;
    }

    noTienenAsistencia() {
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            if (this.turnosSeleccionados[x].asistencia !== false) {
                return false;
            }
        };
        if (this.turnosSeleccionados.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    hayTurnosConEstado(estado) {
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            if (this.turnosSeleccionados[x].estado === estado) {
                return false;
            }
        };
        if (this.turnosSeleccionados.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    noHayTurnosConEstado(estado) {
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            if (this.turnosSeleccionados[x].estado !== estado) {
                return false;
            }
        };
        if (this.turnosSeleccionados.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    hayTurnosTarde() {

        // Si la Agenda actual tiene fecha de hoy...
        if (moment(this.agenda.horaInicio).startOf('day').format() === moment().startOf('day').format()) {
            return this.turnosSeleccionados.filter((turno) => {
                // hay turnos tarde (ya se les pasó la hora)
                return moment(turno.horaInicio).format() < moment().format();
            }).length;
        }

    }

    actualizarBotones() {

        this.botones = {

            // TODO: Refactor nombres métodos hayTurnosConEstado y noHayTurnosConEstado
            darAsistencia: this.agendaNoSuspendida() && (this.noTienenAsistencia() && this.tienenPacientes() && this.hayTurnosConEstado('bloqueado')) && (!this.hayTurnosTarde()),
            sacarAsistencia: (this.agendaNoSuspendida() && this.tienenAsistencia()) && this.tienenPacientes(),
            // "Turno suspendido": Estado bloqueado pero con paciente
            suspenderTurno: (this.agendaNoSuspendida() && this.noTienenAsistencia() && this.noHayTurnosConEstado('asignado')) && (!this.hayTurnosTarde()),
            liberarTurno: (this.agendaNoSuspendida() && this.tienenPacientes() && this.noTienenAsistencia() && this.noHayTurnosConEstado('asignado')),
            // "Turno bloqueado": Estado bloqueado y sin paciente
            bloquearTurno: this.hayTurnosConEstado('disponible') && !this.tienenPacientes() && (!this.hayTurnosTarde()),
            desbloquearTurno: this.hayTurnosConEstado('bloqueado') && !this.tienenPacientes() && (!this.hayTurnosTarde()),

            tdReasignarTurno: this.noHayTurnosConEstado('asignado') && this.noTienenAsistencia(),
            tdNota: this.turnosSeleccionados.length > 0,
            smsVisible: this.agenda.estado === 'Suspendida' && this.noHayTurnosConEstado('asignado') && (!this.hayTurnosTarde()),
            smsNoEnviado: false,

        };

    }

    liberarTurno() {

        this.confirmaLiberarTurno = false;

        this.showTurnos = false;
        this.showLiberarTurno = true;
    }

    suspenderTurno() {

        this.confirmaSuspenderTurno = false;

        this.showTurnos = false;
        this.showSuspenderTurno = true;
    }

    agregarNotaTurno() {
        this.showTurnos = false;
        this.showAgregarNotaTurno = true;
    }

    eventosTurno(opcion) {

        let patch: any = {};

        // Por cada turno...
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {

            patch = {
                'op': opcion,
                'idTurno': this.turnosSeleccionados[x].id
            };

        }
        patch = {
            op: opcion,
            turnos: this.turnosSeleccionados
        };

        this.serviceAgenda.patchMultiple(this.agenda.id, patch).subscribe(

            resultado => {
                this.agenda = resultado;
            },

            err => {
                if (err) {
                    console.log(err);
                }
            }

        );

        // Reset botones y turnos seleccionados
        this.turnosSeleccionados = [];
        this.actualizarBotones();
        this.turnos.forEach((turno, index) => {
            turno.checked = false;
        });
        this.todos = false;
    }

    reasignarTurno(paciente: any, idTurno: any, idAgenda: any) {
        this.reasignar = { 'paciente': paciente, 'idTurno': idTurno, 'idAgenda': idAgenda };

        this.reasignaTurno.emit(this.reasignar);
    }

    reasignarTurnoLiberado(turnoLiberado) {
        this.reasignar = { 'paciente': turnoLiberado.paciente, 'idTurno': turnoLiberado.idTurno, 'idAgenda': turnoLiberado.idAgenda };

        this.reasignaTurno.emit(this.reasignar);
    }

    reasignarTurnoSuspendido(turnoSuspendido) {
        this.reasignar = { 'paciente': turnoSuspendido.paciente, 'idTurno': turnoSuspendido.idTurno, 'idAgenda': turnoSuspendido.idAgenda };

        this.reasignaTurno.emit(this.reasignar);
    }

    agregarPacienteListaEspera(agenda: any, paciente: any) {
        let patch: any = {};
        let pacienteListaEspera = {};

        if (paciente) {
            pacienteListaEspera = paciente;
        } else {
            pacienteListaEspera = this.turnosSeleccionados;
        }

        patch = {
            'op': 'listaEsperaSuspensionAgenda',
            'idAgenda': agenda.id,
            'pacientes': pacienteListaEspera
        };

        this.listaEsperaService.postXIdAgenda(agenda.id, patch).subscribe(resultado => {
            agenda = resultado;

            this.plex.alert('El paciente paso a Lista de Espera');

            this.enviarSMS();

        });
    }

    enviarSMS() {

        let turno;

        for (let x = 0; x < this.turnosSeleccionados.length; x++) {

            let idTurno = this.turnosSeleccionados[x].id;

            this.turnos.filter(function (el, index, arr) {
                if (el.id === idTurno) {
                    turno = el;
                }
            });

            turno.smsVisible = true;
            turno.smsLoader = true;

            if (this.turnosSeleccionados[x].paciente != null) {

                this.smsService.enviarSms(this.turnosSeleccionados[x].paciente.telefono).subscribe(
                    resultado => {
                        turno = this.turnosSeleccionados[x];

                        if (resultado === '0') {
                            turno.smsEnviado = true;
                            turno.smsNoEnviado = false;
                            turno.smsLoader = false;
                        } else {
                            turno.smsEnviado = false;
                            turno.smsNoEnviado = true;
                            turno.smsLoader = false;
                        }

                    },
                    err => {
                        if (err) {
                            console.log(err);
                        }
                    }
                );
            }
        }
    }

    saveLiberarTurno(agenda: any) {

        this.agenda = agenda;

        this.showTurnos = true;
        this.showLiberarTurno = false;
    }

    saveSuspenderTurno(agenda: any) {

        this.agenda = agenda;

        this.showTurnos = true;
        this.showSuspenderTurno = false;
    }

    saveAgregarNotaTurno(agenda: any) {

        this.agenda = agenda;

        this.turnosSeleccionados = [];

        this.showTurnos = false;
        this.showTurnos = true;
        this.showAgregarNotaTurno = false;
        this.turnos.forEach((turno, index) => {
            turno.checked = false;
        });
        this.todos = false;
    }

    cancelaAgregarNota() {

        this.turnosSeleccionados.length = 0;
        this.showTurnos = true;
        this.showAgregarNotaTurno = false;

    }

}
