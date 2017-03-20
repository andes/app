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

    @Input() ag: IAgenda;
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

    agenda: IAgenda;
    turno: ITurno;

    public pacientesSeleccionados: any[] = [];
    public turnos = [];
    public bloques = [];

    private _selectAll;

    public reasignar: any = {};

    public botones: any = {};

    public estadoTurno: String;
    public estadoAsistencia: boolean;

    ngOnInit() {
        this.turnos = this.ag.bloques[0].turnos;

        for (let x = 0; x < this.turnos.length; x++) {
            this.actualizarBotonesTurnos(this.turnos[x]);
        }

        for (let x = 0; x < this.turnos.length; x++) {
            this.actualizarBotones(this.turnos[x]);
        }
    }

    agregarPaciente(turno) {

        this._selectAll = false;

        if (this.pacientesSeleccionados.find(x => x.id === turno._id)) {
            this.pacientesSeleccionados.splice(this.pacientesSeleccionados.indexOf(turno), 1);
            turno.checked = false;
        } else {
            this.pacientesSeleccionados.push(turno);
            turno.checked = true;
        }

        this.setBotones(this.pacientesSeleccionados);

        this.actualizarBotones(turno);

    }

    sonIguales(arr) {
        let x = arr[0];
        return arr.every(function (item) {
            return item === x;
        });
    }

    setBotones(pacientesSeleccionados: any[]) {
        debugger;
        let estado = [];
        let asistencia = [];

        if (pacientesSeleccionados.length > 0) {
            pacientesSeleccionados.forEach(pac => { estado.push(pac.estado) })
            this.estadoTurno = this.sonIguales(estado);

            if (this.estadoTurno) {
                this.estadoTurno = pacientesSeleccionados[0].estado;
            }

            pacientesSeleccionados.forEach(pac => { asistencia.push(pac.asistencia) })
            this.estadoAsistencia = this.sonIguales(asistencia);

            if (this.estadoAsistencia) {
                this.estadoAsistencia = pacientesSeleccionados[0].asistencia;
            }
            else {
                this.estadoTurno = '';
            }

        } else {
            this.estadoTurno = '';
        }
    }

    unsetBotones() {
        this.estadoTurno = '';
        this.estadoAsistencia = null;
    }

    actualizarBotones(turno: any) {
        debugger;
        this.botones = {

            asistencias: (this.ag.estado != 'suspendida') && (this.estadoTurno === 'asignado'),
            darAsistencia: (!this.estadoAsistencia),
            sacarAsistencia: (this.estadoAsistencia),

            // lblTieneAsistencia: (this.ag.estado != 'suspendida') && (turno.paciente) && (turno.asistencia),
            // lblNoTieneAsistencia: (this.ag.estado != 'suspendida') && (turno.paciente) && (!turno.asistencia),

            tdSuspenderTurno: (this.ag.estado !== 'suspendida') && (this.estadoTurno === 'asignado') && (!this.estadoAsistencia),

            tdLiberarTurno: (this.ag.estado !== 'suspendida') && (this.estadoTurno === 'asignado') && (!this.estadoAsistencia),

            tdBloquearTurno: (this.ag.estado !== 'suspendida') && (this.estadoTurno === 'disponible') || (this.estadoTurno === 'bloqueado'),
            bloquearTurno: (this.estadoTurno === 'disponible'),
            desbloquearTurno: (this.estadoTurno === 'bloqueado'),

            tdReasignarTurno: (this.estadoTurno === 'asignado') && (!this.estadoAsistencia),
        }
    }

    actualizarBotonesTurnos(turno: any) {
        debugger;
        turno.botones = {
            nombrePaciente: (this.ag.estado !== 'suspendida') && (turno.paciente),
            lblTurnoDisponible: (this.ag.estado !== 'suspendida') && (!turno.paciente) && (turno.estado !== 'bloqueado'),
            lblTurnoNoDisponible: (this.ag.estado !== 'suspendida') && (!turno.paciente) && (turno.estado === 'bloqueado'),

            asistencias: (this.ag.estado !== 'suspendida') && (turno.paciente),
            darAsistencia: (this.ag.estado !== 'suspendida') && (!turno.asistencia),
            sacarAsistencia: (this.ag.estado !== 'suspendida') && (turno.asistencia === true),

            lblTieneAsistencia: (this.ag.estado !== 'suspendida') && (turno.paciente) && (turno.asistencia),
            lblNoTieneAsistencia: (this.ag.estado !== 'suspendida') && (turno.paciente) && (!turno.asistencia),

            turnoDisponible: (this.ag.estado !== 'suspendida') && (!turno.paciente),

            tdSuspenderTurno: (this.ag.estado != 'suspendida'),
            suspenderTurno: (this.ag.estado != 'suspendida') && (turno.paciente) && (!turno.asistencia),
            suspenderTurnoDeshabilitado: (this.ag.estado != 'suspendida') && (!turno.paciente) || (turno.asistencia),

            tdLiberarTurno: (this.ag.estado != 'suspendida'),
            liberarTurno: (this.ag.estado != 'suspendida') && (turno.paciente) && (!turno.asistencia),
            liberarTurnoDeshabilitado: (this.ag.estado != 'suspendida') && (!turno.paciente) || (turno.asistencia),

            tdBloquearTurno: (this.ag.estado != 'suspendida'),
            bloquearTurno: (this.ag.estado != 'suspendida') && (!turno.paciente) && (turno.estado != 'bloqueado'),
            desbloquearTurno: (this.ag.estado != 'suspendida') && (!turno.paciente) && (turno.estado === 'bloqueado'),
            bloquearTurnoDeshabilitado: (this.ag.estado != 'suspendida') && (turno.paciente),

            tdReasignarTurno: (turno.estado != 'disponible') && (turno.paciente) && (!turno.asistencia),
            reasignarTurno: (turno.paciente) && (!turno.asistencia),
            reasignarTurnoDeshabilitado: ((this.ag.estado != 'suspendida') && (turno.paciente) && (turno.asistencia)) || (!turno.paciente),

            smsVisible: turno.smsVisible,
            smsNoEnviado: turno.smsNoEnviado,
            smsEnviado: turno.smsEnviado,
            smsLoader: turno.smsLoader,

            verNota: true,
            nota: turno.nota
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

        this.pacientesSeleccionados = [];

        this.turnos = this.turnos.filter(
            pac => pac.paciente != null);

        this.turnos.forEach(turno => {
            turno.checked = value;

            if (value) {
                this.pacientesSeleccionados.push(turno);
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

    eventosTurno(agenda: IAgenda, index, event) {

        let btnClicked = event.currentTarget.id;

        let patch: any = {};

        for (let x = 0; x < this.pacientesSeleccionados.length; x++) {
            if (btnClicked === 'darAsistencia') {
                patch = {
                    'op': 'asistenciaTurno',
                    'idTurno': this.pacientesSeleccionados[x].id
                };
            } else if (btnClicked === 'bloquearTurno') {
                patch = {
                    'op': 'bloquearTurno',
                    'idTurno': this.pacientesSeleccionados[x].id
                };
            }

            this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
                this.ag = resultado;
                this.turnos = this.ag.bloques[index].turnos;

                this.setBotones(this.pacientesSeleccionados);
                for (let x = 0; x < this.turnos.length; x++) {
                    this.actualizarBotones(this.turnos[x]);
                }

                for (let x = 0; x < this.turnos.length; x++) {
                    this.actualizarBotonesTurnos(this.turnos[x]);
                }

                this.pacientesSeleccionados.length = 0;
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
            pacienteListaEspera = this.pacientesSeleccionados;
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

        for (let x = 0; x < this.pacientesSeleccionados.length; x++) {

            let idTurno = this.pacientesSeleccionados[x].id;

            this.turnos.filter(function (el, index, arr) {
                if (el.id === idTurno) {
                    turno = el;
                }
            });

            turno.smsVisible = true;
            turno.smsLoader = true;

            this.actualizarBotonesTurnos(turno);

            if (this.pacientesSeleccionados[x].paciente != null) {

                this.smsService.enviarSms(this.pacientesSeleccionados[x].paciente.telefono).subscribe(
                    resultado => {
                        turno = this.pacientesSeleccionados[x];

                        if (resultado === '0') {
                            turno.smsEnviado = true;
                            turno.smsNoEnviado = false;
                            turno.smsLoader = false;
                        } else {
                            turno.smsEnviado = false;
                            turno.smsNoEnviado = true;
                            turno.smsLoader = false;
                        }

                        this.actualizarBotonesTurnos(turno);
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

        this.ag = agenda;
        this.turnos = this.ag.bloques[0].turnos;

        for (let x = 0; x < this.turnos.length; x++) {
            this.actualizarBotonesTurnos(this.turnos[x]);
        }
    }

    saveSuspenderTurno(agenda: any) {
        this.showTurnos = true;
        this.showSuspenderTurno = false;

        this.ag = agenda;
        this.turnos = this.ag.bloques[0].turnos;

        for (let x = 0; x < this.turnos.length; x++) {
            this.actualizarBotonesTurnos(this.turnos[x]);
        }
    }

    saveAgregarNotaTurno(agenda: any) {
        this.showTurnos = true;
        this.showAgregarNotaTurno = false;

        debugger;
        this.pacientesSeleccionados.length = 0;

        this.ag = agenda;
        this.turnos = this.ag.bloques[0].turnos;

        this.unsetBotones();

        for (let x = 0; x < this.turnos.length; x++) {
            this.actualizarBotonesTurnos(this.turnos[x]);
        }

        for (let x = 0; x < this.turnos.length; x++) {
            this.actualizarBotones(this.turnos[x]);
        }
    }

    cancelaAgregarNota() {
        this.showTurnos = true;
        this.showAgregarNotaTurno = false;
    }

    constructor(public plex: Plex, public servicePaciente: PacienteService, public smsService: SmsService,
        public serviceAgenda: AgendaService, public listaEsperaService: ListaEsperaService) { }
}
