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

    // @Input() agenda: IAgenda;

    cantSel: number;
    private _agenda: IAgenda;

    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
        for (let i = 0; i < this.agenda.bloques.length; i++) {
            this.turnos = this.agenda.bloques[i].turnos;

            for (let x = 0; x < this.turnos.length; x++) {
                this.turnos[x].checked = false;
                this.actualizarBotonesTurnos(this.turnos[x]);
            }
        }

        this.cantSel = 0;
        this.todos = false;
        this.turnosSeleccionados = [];
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

            for (let x = 0; x < this.turnos.length; x++) {
                this.actualizarBotonesTurnos(this.turnos[x]);
            }
        }
    }

    seleccionarTurno(turno) {

        // this._selectAll = false;

        if (this.turnosSeleccionados.find(x => x.id === turno._id)) {
            this.turnosSeleccionados.splice(this.turnosSeleccionados.indexOf(turno), 1);
        } else {
            this.turnosSeleccionados = [... this.turnosSeleccionados, turno];
        }

        this.turnosSeleccionados.sort((a, b) => {
            return (a.horaInicio.getTime() > b.horaInicio.getTime() ? 1 : (b.horaInicio.getTime() > a.horaInicio.getTime() ? -1 : 0));
        });

        this.cantSel = this.turnosSeleccionados.length;

        this.actualizarBotones(turno);

    }

    seleccionarTodos() {

        for (let i = 0; i < this.agenda.bloques.length; i++) {
            this.agenda.bloques[i].turnos.forEach((turno, index) => {
                if (!this.todos) {
                    this.seleccionarTurno(turno);
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
    }

    sonIguales(arr) {
        let x = arr[0];
        return arr.every(function (item) {
            return item === x;
        });
    }

    // setBotones(turnosSeleccionados: any[]) {
    //     let estado = [];
    //     let asistencia = [];

    //     if (turnosSeleccionados.length > 0) {
    //         turnosSeleccionados.forEach(pac => { estado.push(pac.estado) })
    //         this.estadoTurno = this.sonIguales(estado);

    //         if (this.estadoTurno) {
    //             this.estadoTurno = turnosSeleccionados[0].estado;
    //         }

    //         turnosSeleccionados.forEach(pac => { asistencia.push(pac.asistencia) })
    //         this.estadoAsistencia = this.sonIguales(asistencia);

    //         if (this.estadoAsistencia) {
    //             this.estadoAsistencia = turnosSeleccionados[0].asistencia;
    //         } else {
    //             this.estadoTurno = '';
    //         }

    //     } else {
    //         this.estadoTurno = '';
    //     }
    // }

    // unsetBotones() {
    //     this.estadoTurno = '';
    //     this.estadoAsistencia = null;
    // }

    agendaNoSuspendida() {
        return this.agenda.estado !== 'Suspendida';
    }

    tienenPacientes() {
        return this.turnosSeleccionados.filter((turno) => {
            return turno.paciente;
        }).length > 0;
    }

    tienenAsistencia() {
        this.turnosSeleccionados.forEach((turno) => {
            console.log('tienenAsistencia():', turno.asistencia);
            if (turno.asistencia === false) {
                return false;
            }
        });
        return true;
        // debugger
        // return this.turnosSeleccionados.filter((turno) => {
        //     return turno.asistencia === true;
        // }).length === this.turnosSeleccionados.length;
    }

    noTienenAsistencia() {
        this.turnosSeleccionados.forEach((turno) => {
            console.log('turno:', turno);
            if (turno.asistencia !== false) {
                return false;
            }
        });
        return true;
        // debugger
        // return this.turnosSeleccionados.filter((turno) => {
        //     return turno.asistencia === true;
        // }).length === this.turnosSeleccionados.length;
    }


    actualizarBotonesTurnos(turno: any) {
        debugger;
        this.botonesTurno = {
            nombrePaciente: this.agendaNoSuspendida() && (turno.paciente),
            lblTurnoDisponible: this.agendaNoSuspendida() && (!turno.paciente) && (turno.estado !== 'bloqueado'),
            lblTurnoNoDisponible: this.agendaNoSuspendida() && (!turno.paciente) && (turno.estado === 'bloqueado'),

            darAsistencia: (this.agendaNoSuspendida() && !this.noTienenAsistencia()),
            sacarAsistencia: (this.agendaNoSuspendida() && this.tienenAsistencia()),
            //asistencias: !(this.botones.darAsistencia && this.botones.sacarAsistencia),

            // asistencias: this.agendaNoSuspendida() && this.tienenPacientes(),
            // darAsistencia: this.agendaNoSuspendida() && !this.tienenAsistencia(),
            // sacarAsistencia: this.agendaNoSuspendida() && this.tienenAsistencia(),

            // lblTieneAsistencia: this.agendaNoSuspendida() && (turno.paciente) && (turno.asistencia),
            // lblNoTieneAsistencia: this.agendaNoSuspendida() && (turno.paciente) && (!turno.asistencia),

            turnoDisponible: this.agendaNoSuspendida() && (!turno.paciente),

            tdSuspenderTurno: this.agendaNoSuspendida(),
            suspenderTurno: this.agendaNoSuspendida() && (turno.paciente) && (!turno.asistencia),
            suspenderTurnoDeshabilitado: this.agendaNoSuspendida() && (!turno.paciente) || (turno.asistencia),

            tdLiberarTurno: this.agendaNoSuspendida(),
            liberarTurno: this.agendaNoSuspendida() && (turno.paciente) && (!turno.asistencia),
            liberarTurnoDeshabilitado: this.agendaNoSuspendida() && (!turno.paciente) || (turno.asistencia),

            tdBloquearTurno: this.agendaNoSuspendida(),
            bloquearTurno: this.agendaNoSuspendida() && (!turno.paciente) && (turno.estado !== 'bloqueado'),
            desbloquearTurno: this.agendaNoSuspendida() && (!turno.paciente) && (turno.estado === 'bloqueado'),
            bloquearTurnoDeshabilitado: this.agendaNoSuspendida() && (turno.paciente),

            tdReasignarTurno: (turno.estado !== 'disponible') && (turno.paciente) && (!turno.asistencia),
            reasignarTurno: (turno.paciente) && (!turno.asistencia),
            reasignarTurnoDeshabilitado: (this.agendaNoSuspendida() && (turno.paciente) && (turno.asistencia)) || (!turno.paciente),

            smsVisible: turno.smsVisible,
            smsNoEnviado: turno.smsNoEnviado,
            smsEnviado: turno.smsEnviado,
            smsLoader: turno.smsLoader,

            verNota: true,
            nota: (this.agenda.estado !== 'Suspendida') && turno.nota
        };

    }

    actualizarBotones(turno: any) {
        console.log('this.turnosSeleccionados:', this.turnosSeleccionados);
        this.botones = {

            darAsistencia: (this.agendaNoSuspendida() && this.noTienenAsistencia()),
            sacarAsistencia: (this.agendaNoSuspendida() && !this.tienenAsistencia()),
            // asistencias: !(this.botones.darAsistencia && this.botones.sacarAsistencias),

            lblTurnoDisponible: true,

            // lblTieneAsistencia: (this.agenda.estado != 'Suspendida') && (turno.paciente) && (turno.asistencia),
            // lblNoTieneAsistencia: (this.agenda.estado != 'Suspendida') && (turno.paciente) && (!turno.asistencia),

            tdSuspenderTurno: (this.agenda.estado !== 'Suspendida') && (this.estadoTurno === 'asignado') && (!this.estadoAsistencia),

            tdLiberarTurno: (this.agenda.estado !== 'Suspendida') && (this.estadoTurno === 'asignado') && (!this.estadoAsistencia),

            tdBloquearTurno: (this.agenda.estado !== 'Suspendida') && (this.estadoTurno === 'disponible') || (this.estadoTurno === 'bloqueado'),

            bloquearTurno: (this.estadoTurno === 'disponible'),

            desbloquearTurno: (this.estadoTurno === 'bloqueado'),

            tdReasignarTurno: (this.estadoTurno === 'asignado') && (!this.estadoAsistencia),
            tdNota: this.turnosSeleccionados.length > 0
        };
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
                    'op': 'asistenciaTurno',
                    'idTurno': this.turnosSeleccionados[x].id
                };
            } else if (btnClicked === 'bloquearTurno') {
                patch = {
                    'op': 'bloquearTurno',
                    'idTurno': this.turnosSeleccionados[x].id
                };
            }

            this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {

                debugger;
                this.agenda = resultado;

                this.turnos = this.agenda.bloques[0].turnos;

                for (let y = 0; y < this.turnos.length; y++) {
                    this.actualizarBotones(this.turnos[y]);
                }

                this.turnosSeleccionados.length = 0;
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
        this.showTurnos = true;
        this.showLiberarTurno = false;

        this.agenda = agenda;

        for (let i = 0; i < this.agenda.bloques.length; i++) {
            this.turnos = this.agenda.bloques[i].turnos;
        }
    }

    saveSuspenderTurno(agenda: any) {
        this.showTurnos = true;
        this.showSuspenderTurno = false;

        this.agenda = agenda;

        for (let i = 0; i < this.agenda.bloques.length; i++) {
            this.turnos = this.agenda.bloques[i].turnos;
        }
    }

    saveAgregarNotaTurno(agenda: any) {

        this.agenda = agenda;

        this.turnosSeleccionados.length = 0;

        // for (let i = 0; i < this.agenda.bloques.length; i++) {
        //     this.turnos = this.agenda.bloques[i].turnos;

        // for (let x = 0; x < this.turnos.length; x++) {
        //     this.actualizarBotones(this.turnos[x]);
        // }

        // for (let x = 0; x < this.turnos.length; x++) {
        //     this.actualizarBotonesTurnos(this.turnos[x]);
        // }

        // }

        this.showTurnos = false;
        this.showTurnos = true;
        this.showAgregarNotaTurno = false;
    }

    cancelaAgregarNota() {

        this.turnosSeleccionados.length = 0;

        for (let i = 0; i < this.agenda.bloques.length; i++) {
            this.turnos = this.agenda.bloques[i].turnos;

            for (let x = 0; x < this.turnos.length; x++) {
                this.actualizarBotones(this.turnos[x]);
            }
        }

        this.showTurnos = true;
        this.showAgregarNotaTurno = false;
    }

    constructor(public plex: Plex, public servicePaciente: PacienteService, public smsService: SmsService,
        public serviceAgenda: AgendaService, public listaEsperaService: ListaEsperaService) { }
}
