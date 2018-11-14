import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../interfaces/turnos/ITurno';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { PacienteService } from './../../../services/paciente.service';
import { SmsService } from './../../../services/turnos/sms.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { ListaEsperaService } from '../../../services/turnos/listaEspera.service';
import { EstadosAgenda } from './../enums';
import * as moment from 'moment';

@Component({
    selector: 'turnos',
    templateUrl: 'turnos.html',
    styleUrls: ['./turnos.scss']
})

export class TurnosComponent implements OnInit {
    private _agenda: IAgenda;
    public idOrganizacion = this.auth.organizacion.id;
    // Parámetros
    @Input('agenda')
    set agenda(value: any) {
        this.hoy = new Date();
        this._agenda = value;
        this.delDia = this.agenda.horaInicio >= moment().startOf('day').toDate() && this.agenda.horaInicio <= moment().endOf('day').toDate();
        this.turnosSeleccionados = [];
        this.horaInicio = moment(this._agenda.horaInicio).format('dddd').toUpperCase();

        this.arrayDelDia = [];
        this.bloques = this.agenda.bloques;
        for (let i = 0; i < this.bloques.length; i++) {
            this.turnos = this.agenda.bloques[i].turnos;
            // Si la agenda es del día, resto los disponibles que ya pasaron
            if (this.delDia) {
                let bloque = this.agenda.bloques[i];
                this.arrayDelDia[i] = bloque.restantesDelDia + bloque.restantesProgramados;
            }
            if (this.agenda.bloques[i].turnos) {
                this.agenda.bloques[i].turnos.forEach((turno) => {
                    // Si el turno está disponible pero ya paso la hora
                    if (turno.estado === 'disponible' && this.delDia && this.agenda.horaFin < this.hoy) {
                        this.arrayDelDia[i]--;
                    }
                });
            }
        }

        this.actualizarBotones();
    }
    get agenda(): any {
        return this._agenda;
    }

    @Input() reasturnos: IAgenda;
    @Output() reasignaTurno = new EventEmitter<boolean>();
    @Output() recargarAgendas = new EventEmitter<boolean>();
    @Output() recargarBotones = new EventEmitter<boolean>();

    // Propiedades públicas
    showSeleccionarTodos = true;
    showTurnos = true;
    showLiberarTurno = false;
    showSuspenderTurno = false;
    showAgregarNotaTurno = false;
    showCarpetaPaciente = false;
    smsEnviado: Boolean = false;
    smsLoader: Boolean = false;
    turnos = [];
    turnosSeleccionados: any[] = [];
    turno: ITurno;
    cantSel: number;
    todos = false;
    reasignar: any = {};
    horaInicio: any;
    bloques = [];
    hoy: Date;
    // Contiene el cálculo de la visualización de botones
    botones: any = {};
    public estadosAgenda = EstadosAgenda;
    public mostrarHeaderCompleto = false;
    public delDia = false;
    public arrayDelDia = [];

    // Inicialización
    constructor(public plex: Plex, public smsService: SmsService, public serviceAgenda: AgendaService, public listaEsperaService: ListaEsperaService, public servicePaciente: PacienteService, public auth: Auth) { }

    ngOnInit() {
        this.turnosSeleccionados = [];
        let agendaActualizar = this.agenda;
        // this.agenda = this.actualizarCarpetaPaciente(agendaActualizar);
        this.actualizarBotones();
        this.showSeleccionarTodos = (this.turnos.length > 0);
    }

    seleccionarTurno(turno, multiple = false, sobreturno) {
        turno.sobreturno = sobreturno;
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

        for (let i = 0; i < this.agenda.sobreturnos.length; i++) {
            if (!this.todos) {
                this.agenda.sobreturnos[i].checked = true;
                this.turnosSeleccionados = [...this.turnosSeleccionados, this.agenda.sobreturnos[i]];
            } else {
                this.agenda.sobreturnos[i].checked = false;
            }
        }

        this.todos = !this.todos;
        this.cantSel = this.turnosSeleccionados.length;
        this.actualizarBotones();
    }

    agendaNoSuspendida() {
        return this.agenda.estado !== 'suspendida';
    }

    agendaNoCerrada() {
        return this.agenda.estado !== 'pendienteAuditoria' && this.agenda.estado !== 'pendienteAsistencia' && this.agenda.estado !== 'codificada' && this.agenda.estado !== 'auditada';
    }

    tienenPacientes() {
        return this.turnosSeleccionados.filter((turno) => {
            return (turno.paciente && turno.paciente.id);
        }).length === this.turnosSeleccionados.length;
    }

    tienenAsistencia() {
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            if (this.turnosSeleccionados[x].asistencia !== 'asistio') {
                return false;
            }
        }
        return true;
    }

    noTienenAsistencia() {
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            if (this.turnosSeleccionados[x].asistencia === 'asistio') {
                return false;
            }
        }
        return this.turnosSeleccionados.length > 0;
    }

    ningunoConEstado(estado) {
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            if (this.turnosSeleccionados[x].estado === estado) {
                return false;
            }
        }
        return this.turnosSeleccionados.length > 0;
    }

    todosConEstado(estado) {
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            if (this.turnosSeleccionados[x].estado !== estado) {
                return false;
            }
        }
        return this.turnosSeleccionados.length > 0;
    }

    hayTurnosTarde() {
        // Si la Agenda actual tiene fecha de hoy...
        if (moment(this.agenda.horaInicio).startOf('day').format() >= moment().startOf('day').format()) {
            return this.turnosSeleccionados.filter((turno) => {
                // hay turnos tarde (ya se les pasó la hora)
                return moment(turno.horaInicio).format() < moment().format();
            }).length;
        }
    }

    siguienteDisponible() {
        let index;
        let bloqueTurno;
        let turnoSeleccionado;
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            // Se busca la posición del turno y se verifica que el siguiente turno se encuentre disponible
            turnoSeleccionado = this.turnosSeleccionados[x];
            bloqueTurno = this.bloques.find(bloque => (bloque.turnos.findIndex(t => (t._id === turnoSeleccionado._id)) >= 0));
            if (bloqueTurno) {
                index = bloqueTurno.turnos.findIndex(t => { return t._id === turnoSeleccionado._id; });
                if ((index === -1) || ((index < bloqueTurno.turnos.length - 1) && (bloqueTurno.turnos[index + 1].estado !== 'disponible')) || (index === (bloqueTurno.turnos.length - 1))) {
                    return false;
                }
                if (bloqueTurno.citarPorBloque) {
                    if (String(bloqueTurno.turnos[index].horaInicio) !== String(bloqueTurno.turnos[index + 1].horaInicio)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    agendaHoy() {
        return moment(this.agenda.horaInicio).startOf('day').format() >= moment().startOf('day').format();
    }

    actualizarBotones() {
        let puedeRegistrarAsistencia = this.auth.getPermissions('turnos:turnos:registrarAsistencia:').length > 0;
        let puedeSuspenderTurno = this.auth.getPermissions('turnos:turnos:suspenderTurno:').length > 0;
        let puedeLiberarTurno = this.auth.getPermissions('turnos:turnos:liberarTurno:').length > 0;
        let puedeEditarCarpeta = this.auth.getPermissions('turnos:turnos:editarCarpeta:').length > 0;
        let puedeMarcarTurnDoble = this.auth.getPermissions('turnos:turnos:turnoDoble:').length > 0;
        this.botones = {
            // Dar asistencia: el turno está con paciente asignado, sin asistencia ==> pasa a estar con paciente asignado, con asistencia
            darAsistencia: puedeRegistrarAsistencia && this.agendaNoCerrada() && this.tienenPacientes() && this.agendaNoSuspendida() && (this.noTienenAsistencia() && this.ningunoConEstado('suspendido')) && this.agendaHoy(),
            // Sacar asistencia: el turno está con paciente asignado, con asistencia ==> pasa a estar "sin asistencia" (mantiene el paciente)
            sacarAsistencia: puedeRegistrarAsistencia && this.agendaNoCerrada() && this.tienenAsistencia() && this.tienenPacientes(),
            // Suspender turno: El turno no tiene asistencia ==> el estado pasa a "suspendido"
            suspenderTurno: puedeSuspenderTurno && this.agendaNoCerrada() && this.agendaNoSuspendida() && this.noTienenAsistencia() && this.ningunoConEstado('suspendido') && this.ningunoConEstado('turnoDoble'),
            // Liberar turno: está "asignado" ==> el estado pasa a "disponible" y se elimina el paciente
            liberarTurno: puedeLiberarTurno && this.agendaNoCerrada() && (this.turnosSeleccionados.length === 1 && !this.turnosSeleccionados[0].sobreturno && this.agendaNoSuspendida() && this.tienenPacientes() && this.noTienenAsistencia() && this.todosConEstado('asignado')),
            // Pasar paciente a la lista de espera: está "asignado" pero sin asistencia ==> Pasa a la "bolsa de gatos"
            listaDeEspera: this.agendaNoCerrada() && this.agendaNoSuspendida() && this.todosConEstado('asignado') && this.noTienenAsistencia(),
            // Se verifica si el siguiente turno se encuentra disponible
            turnoDoble: puedeMarcarTurnDoble && this.turnosSeleccionados.length === 1 && this.agendaNoCerrada() && this.agendaNoSuspendida() && this.tienenPacientes() && this.noTienenAsistencia()
                && this.todosConEstado('asignado') && this.siguienteDisponible(),
            // Se puede quitar turno doble sólo si está en ese estado
            quitarTurnoDoble: puedeMarcarTurnDoble && this.turnosSeleccionados.length === 1 && this.agendaNoCerrada() && this.agendaNoSuspendida() && this.todosConEstado('turnoDoble') && !this.isDobleSuspendido(),
            // Enviar SMS
            // sms: this.agendaNoSuspendida() && this.todosConEstado('asignado') && this.todosConEstado('suspendido') && this.noTienenAsistencia() && (!this.hayTurnosTarde()),
            nota: this.agendaNoCerrada() && this.turnosSeleccionados.length > 0,
            // Se puede editar carpeta si el turno tiene paciente
            editarCarpeta: puedeEditarCarpeta && this.agendaNoCerrada() && this.turnosSeleccionados.length === 1 && this.tienenPacientes()
        };
    }

    isDobleSuspendido() {
        let indiceTurnoPadre = this.turnos.indexOf(this.turnosSeleccionados[0]) - 1;
        let response = (this.turnos[indiceTurnoPadre].estado === 'suspendido');
        return response;
    }

    liberarTurno() {
        this.showTurnos = false;
        this.showLiberarTurno = true;
    }

    suspenderTurno() {
        this.showTurnos = false;
        this.showSuspenderTurno = true;
    }

    agregarNotaTurno() {
        this.showTurnos = false;
        this.showAgregarNotaTurno = true;
    }

    editarCarpetaPaciente() {
        this.showTurnos = false;
        this.showCarpetaPaciente = true;
    }

    // Se usa tanto para guardar como cancelar
    afterComponenteCarpeta(carpetas) {
        // Siempre es 1 sólo el seleccionado cuando se edita una carpeta
        if (carpetas) {
            this.turnosSeleccionados[0].paciente.carpetaEfectores = carpetas;
            // this.seleccionarTurno(this.turnosSeleccionados[0], false, false);
        }
        this.showCarpetaPaciente = false;
        this.showTurnos = true;
    }

    eventosTurno(operacion) {
        let patch: any = {
            op: operacion,
            turnos: this.turnosSeleccionados.map((resultado) => { return resultado.id; })
        };

        // Patchea los turnosSeleccionados (1 o más turnos)
        this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {
            this.agenda = resultado;
        });

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

    asignarTurnoDoble(operacion) {
        let turnoSeleccionado;
        let index;
        let turnosActualizar = [];
        let bloqueTurno;
        for (let x = 0; x < this.turnosSeleccionados.length; x++) {
            // Se busca la posición del turno y se obtiene el siguiente
            turnoSeleccionado = this.turnosSeleccionados[x];
            bloqueTurno = this.bloques.find(bloque => (bloque.turnos.findIndex(t => (t._id === turnoSeleccionado._id)) >= 0));

            if (bloqueTurno) {
                index = bloqueTurno.turnos.findIndex(t => { return t._id === turnoSeleccionado._id; });
                if ((index > -1) && (index < bloqueTurno.turnos.length - 1) && (bloqueTurno.turnos[index + 1].estado === 'disponible')) {
                    turnosActualizar.push(bloqueTurno.turnos[index + 1]);
                } else {
                    // en el caso que el turno siguiente no se encuentre disponible
                    this.plex.alert('No se puede asignar el turno doble');
                }
            }
        }

        let patch: any = {
            op: operacion,
            turnos: turnosActualizar.map((resultado) => { return resultado.id; })
        };

        // Patchea los turnosSeleccionados (1 o más turnos)
        this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => { this.agenda = resultado; });
        // Reset botones y turnos seleccionados
        this.turnosSeleccionados = [];
        this.actualizarBotones();
        this.turnos.forEach((turno) => {
            turno.checked = false;
        });
        this.todos = false;

    }

    agregarPacienteListaEspera(agenda: any) {
        let patch: any = {};
        let pacienteListaEspera = {};

        pacienteListaEspera = this.turnosSeleccionados;

        patch = {
            'op': 'listaEsperaSuspensionAgenda',
            'idAgenda': agenda.id,
            'pacientes': pacienteListaEspera
        };

        // Bag of cats
        this.listaEsperaService.postXIdAgenda(agenda.id, patch).subscribe(resultado => {
            this.agenda = resultado;
            this.plex.alert('El paciente pasó a Lista de Espera');
            // this.enviarSMS();
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

            // Siempre chequear que exista el id de paciente, porque puede haber una key "paciente" vacía
            if (this.turnosSeleccionados[x].paciente && this.turnosSeleccionados[x].paciente.id) {

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

                        }
                    }
                );
            }
        }
    }

    saveLiberarTurno(agenda: any) {
        this.serviceAgenda.getById(agenda.id).subscribe(ag => {
            this.agenda = ag;
            this.showTurnos = true;
            this.showLiberarTurno = false;
        });
    }

    saveSuspenderTurno() {
        this.serviceAgenda.getById(this.agenda.id).subscribe(ag => {
            this.agenda = ag;
            this.showTurnos = true;
            this.showSuspenderTurno = false;
            this.recargarAgendas.emit(true);
            this.recargarBotones.emit(true);
        });
    }

    saveAgregarNotaTurno() {
        this.serviceAgenda.getById(this.agenda.id).subscribe(ag => {
            this.agenda = ag;
            this.turnosSeleccionados = [];

            this.showTurnos = true;
            this.showAgregarNotaTurno = false;
            this.turnos.forEach((turno, index) => {
                turno.checked = false;
            });
            this.todos = false;
        });
    }


    cancelaAgregarNota() {
        this.turnosSeleccionados.length = 0;
        this.showTurnos = true;
        this.showAgregarNotaTurno = false;
    }

    cancelaLiberarTurno() {
        this.turnosSeleccionados.length = 0;
        this.showTurnos = true;
        this.showLiberarTurno = false;
    }

    cancelaSuspenderTurno() {
        this.turnosSeleccionados.length = 0;
        this.showTurnos = true;
        this.showSuspenderTurno = false;
    }

    saveCarpetaPaciente() {
        this.showTurnos = true;
        this.showCarpetaPaciente = false;
        return true;
    }
}
