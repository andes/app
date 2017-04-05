import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { Plex } from '@andes/plex';
import { PacienteService } from './../../services/paciente.service';
import { SmsService } from './../../services/turnos/sms.service';
import { AgendaService } from '../../services/turnos/agenda.service';
import { ListaEsperaService } from '../../services/turnos/listaEspera.service';

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

    cantSel: number;
    private _agenda: IAgenda;

    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
        for (let i = 0; i < this.agenda.bloques.length; i++) {
            this.turnos = this.agenda.bloques[i].turnos;
        }
        this.actualizarBotones();

        this.cantSel = 0;
        
    }
    get agenda(): any {
        return this._agenda;
    }



    @Input() reasturnos: IAgenda;

    @Output() reasignaTurno = new EventEmitter<boolean>();

    showTurnos: Boolean = true;
    public showLiberarTurno: Boolean = false;
    public showSuspenderTurno: Boolean = false;
    public showAgregarNotaTurno: Boolean = false;

    smsEnviado: Boolean = false;
    smsLoader: Boolean = false;

    resultado: any;

    listaEspera: any;

    turno: ITurno;

    todos: Boolean = false;

    public turnosSeleccionados: any[] = [];
    public turnos = [];
    public bloques = [];

    private _selectAll;

    public reasignar: any = {};

    public botones: any = {};
    public botonesTurno: any = {};

    public estadoTurno: String;
    public estadoAsistencia: boolean;

    ngOnInit() {
        this.turnosSeleccionados = [];
        for (let i = 0; i < this.agenda.bloques.length; i++) {
            this.turnos = this.agenda.bloques[i].turnos;

            this.actualizarBotones();
        }
    }

    seleccionarTurno(turno) {

        if (this.turnosSeleccionados.find(x => x.id === turno._id)) {
            this.turnosSeleccionados.splice(this.turnosSeleccionados.indexOf(turno), 1);
        } else {
            this.turnosSeleccionados = [... this.turnosSeleccionados, turno];
        }

        this.turnosSeleccionados.sort((a, b) => {
            return (a.horaInicio.getTime() > b.horaInicio.getTime() ? 1 : (b.horaInicio.getTime() > a.horaInicio.getTime() ? -1 : 0));
        });

        this.cantSel = this.turnosSeleccionados.length;

        if ( this.cantSel === 0 ) {
            this.todos = false;
        }

        if ( this.cantSel === this.turnos.length ) {
            this.todos = true;
        }

        this.actualizarBotones();

    }

    seleccionarTodos() {

        for (let i = 0; i < this.agenda.bloques.length; i++) {
            this.agenda.bloques[i].turnos.forEach((turno, index) => {
                if (!this.todos) {
                    this.turnosSeleccionados = [...this.turnosSeleccionados, turno];
                    turno.checked = true;
                } else {
                    this.turnosSeleccionados = [];
                    turno.checked = false;
                }
            });
        }

        this.cantSel = this.turnosSeleccionados.length;
        this.todos = !this.todos;

        this.actualizarBotones();
    }

    sonIguales(arr) {
        let x = arr[0];
        return arr.every(function (item) {
            return item === x;
        });
    }

    agendaNoSuspendida() {
        return this.agenda.estado !== 'Suspendida';
    }

    tienenPacientes() {
        return this.turnosSeleccionados.filter((turno) => {
            return turno.paciente;
        }).length > 0;
    }

    tienenAsistencia() {
        let band = true;
        for (let x = 0; x < this.turnosSeleccionados.length && band; x++) {
            if (this.turnosSeleccionados[x].asistencia !== true) {
                band = false;
            }
        };
        return band;
    }

   noTienenAsistencia() {
        let band = true;
        for (let x = 0; x < this.turnosSeleccionados.length && band; x++) {
            if (this.turnosSeleccionados[x].asistencia !== false) {
                band = false;
            }
        };
        return band;
    }

    actualizarBotones() {

        this.botones = {

            darAsistencia: (this.agendaNoSuspendida() && this.noTienenAsistencia() && !this.tienenAsistencia()) && this.tienenPacientes(),
            sacarAsistencia: (this.agendaNoSuspendida() && this.tienenAsistencia() && !this.noTienenAsistencia()) && this.tienenPacientes(),

            tdSuspenderTurno: (this.agendaNoSuspendida()) && (this.estadoTurno === 'asignado') && (!this.estadoAsistencia),

            tdLiberarTurno: (this.agendaNoSuspendida()) && (this.estadoTurno === 'asignado') && (!this.estadoAsistencia),

            tdBloquearTurno: (this.agendaNoSuspendida()) && (this.estadoTurno === 'disponible') || (this.estadoTurno === 'bloqueado'),

            bloquearTurno: (this.estadoTurno === 'disponible'),

            desbloquearTurno: (this.estadoTurno === 'bloqueado'),

            tdReasignarTurno: (this.estadoTurno === 'asignado') && (!this.estadoAsistencia),
            tdNota: this.turnosSeleccionados.length > 0
        };
    }


    liberarTurno(agenda: any) {
        this.agenda = agenda;
        // this.turno = turno;

        this.confirmaLiberarTurno = false;

        this.showTurnos = false;
        this.showLiberarTurno = true;
    }

    suspenderTurno(agenda: any) {
        this.agenda = agenda;

        this.confirmaSuspenderTurno = false;

        this.showTurnos = false;
        this.showSuspenderTurno = true;
    }

    agregarNotaTurno(agenda: any) {
        this.agenda = agenda;
        this.showTurnos = false;
        this.showAgregarNotaTurno = true;
    }

    eventosTurno(agenda: IAgenda, event) {

        let btnClicked = event.currentTarget.id;

        let patch: any = {};

        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            if (btnClicked === 'darAsistencia') {
                patch = {
                    'op': 'darAsistencia',
                    'idTurno': this.turnosSeleccionados[x].id
                };
            } else if (btnClicked === 'sacarAsistencia') {
                patch = {
                    'op': 'sacarAsistencia',
                    'idTurno': this.turnosSeleccionados[x].id
                };
            } else if (btnClicked === 'bloquearTurno') {
                patch = {
                    'op': 'bloquearTurno',
                    'idTurno': this.turnosSeleccionados[x].id
                };
            }

            this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {

                this.agenda = resultado;

                this.turnos = this.agenda.bloques[0].turnos;

                this.actualizarBotones();

                this.turnosSeleccionados = [];
            },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
        }
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
                    });
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
    }

    cancelaAgregarNota() {

        this.turnosSeleccionados.length = 0;

        this.actualizarBotones();

        this.showTurnos = true;
        this.showAgregarNotaTurno = false;

    }

    @Input()
    public get selectAll() {
        return this._selectAll;
    }
    public set selectAll(value) {
        if (!this.turnos) {
            return;
        }

        this.turnosSeleccionados = [];

        this.turnos = this.turnos.filter(
            pac => pac.paciente != null);

        this.turnos.forEach(turno => {
            turno.checked = value;

            if (value) {
                this.turnosSeleccionados.push(turno);
            }
        });

        this._selectAll = value;
    }

    constructor(public plex: Plex, public servicePaciente: PacienteService, public smsService: SmsService,
        public serviceAgenda: AgendaService, public listaEsperaService: ListaEsperaService) { }
}
