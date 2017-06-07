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
  templateUrl: 'turnos.html'
})

export class TurnosComponent implements OnInit {
  private _agenda: IAgenda;
  // Parámetros
  @Input('agenda')
  set agenda(value: any) {
    this._agenda = value;
    this.turnosSeleccionados = [];
    this.horaInicio = moment(this._agenda.horaInicio).format('dddd').toUpperCase();

    // for (let i = 0; i < this.agenda.bloques.length; i++) {
    //   this.turnos = this.agenda.bloques[i].turnos;
    // }

    this.bloques = this.agenda.bloques;
    for (let i = 0; i < this.bloques.length; i++) {
        this.turnos = (this.bloques[i].turnos).filter((turno) => { return turno.estado === 'asignado'; });
        for (let t = 0; t < this.turnos.length; t++) {
            // let params = { documento: this.turnos[t].paciente.documento, organizacion: this.auth.organizacion.id };
            this.servicePaciente.getById(this.turnos[t].paciente.id).subscribe((paciente) => {
                if (paciente && paciente.carpetaEfectores) {
                    let carpetaEfector = null;
                    carpetaEfector = paciente.carpetaEfectores.filter((data) => {
                        return (data.organizacion.id === this.auth.organizacion.id);
                    });
                    this.turnos[t].paciente.carpetaEfectores = carpetaEfector;
                }
            });
        }
        // this.bloques[i].turnos = this.turnos;
    }
    this.actualizarBotones();
  }
  get agenda(): any {
    return this._agenda;
  }

  @Input() reasturnos: IAgenda;
  @Output() reasignaTurno = new EventEmitter<boolean>();

  // Propiedades públicas
  showTurnos = true;
  showLiberarTurno = false;
  showSuspenderTurno = false;
  showAgregarNotaTurno = false;
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
  // Contiene el cálculo de la visualización de botones
  botones: any = {};
  public estadosAgenda = EstadosAgenda;
  public mostrarHeaderCompleto = false;

  // Inicialización
  constructor(public plex: Plex, public smsService: SmsService, public serviceAgenda: AgendaService, public listaEsperaService: ListaEsperaService, public servicePaciente: PacienteService, public auth: Auth) { }

  ngOnInit() {
    this.turnosSeleccionados = [];
    let agendaActualizar = this.agenda;
    // this.agenda = this.actualizarCarpetaPaciente(agendaActualizar);
    this.actualizarBotones();
  }

  // Métodos públicos
  actualizarCarpetaPaciente(agendaActualizar: any) {
    let turnosBloque;
    let turnosModificados = [];
    for (let i = 0; i < agendaActualizar.bloques.length; i++) {
      turnosBloque = agendaActualizar.bloques[i].turnos;
      turnosModificados = turnosBloque.map(turno => {
        if (turno.paciente) {
          this.servicePaciente.getById(turno.paciente.id).subscribe((paciente) => {
            if (paciente && paciente.carpetaEfectores && paciente.carpetaEfectores.length > 0) {
              let carpetaEfector = null;
              carpetaEfector = paciente.carpetaEfectores.filter((data) => {
                return (data.organizacion.id === this.auth.organizacion.id);
              });
              // this.turnos[t].paciente.carpetaEfectores = new Object();
              turno.paciente.carpetaEfectores = carpetaEfector;
              return turno;
            }
          });
        } else {
          return turno;
        }
      });
      agendaActualizar.bloques[i].turnos = turnosModificados;
    }
    return agendaActualizar;
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

  tienenPacientes() {
    return this.turnosSeleccionados.filter((turno) => {
      return turno.paciente;
    }).length === this.turnosSeleccionados.length;
  }

  tienenAsistencia() {
    for (let x = 0; x < this.turnosSeleccionados.length; x++) {
      if (this.turnosSeleccionados[x].asistencia !== 'asistio') {
        return false;
      }
    };
    return true;
  }

  noTienenAsistencia() {
    for (let x = 0; x < this.turnosSeleccionados.length; x++) {
      if (this.turnosSeleccionados[x].asistencia === 'asistio') {
        return false;
      }
    };
    if (this.turnosSeleccionados.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  ningunoConEstado(estado) {
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

  todosConEstado(estado) {
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
    if (moment(this.agenda.horaInicio).startOf('day').format() >= moment().startOf('day').format()) {
      return this.turnosSeleccionados.filter((turno) => {
        // hay turnos tarde (ya se les pasó la hora)
        return moment(turno.horaInicio).format() < moment().format();
      }).length;
    }
  }

  siguienteDisponible() {
    let index;
    let turnos = this.turnos;
    let turnoSeleccionado;
    for (let x = 0; x < this.turnosSeleccionados.length; x++) {
      // Se busca la posición del turno y se verifica que el siguiente turno se encuentre disponible
      turnoSeleccionado = this.turnosSeleccionados[x];
      index = turnos.findIndex(t => { return t._id === turnoSeleccionado._id; });
      if ((index === -1) || ((index < turnos.length - 1) && (turnos[index + 1].estado !== 'disponible')) || (index === (turnos.length - 1))) {
        return false;
      }
    }
    return true;
  }

  agendaHoy() {
    return moment(this.agenda.horaInicio).startOf('day').format() >= moment().startOf('day').format();
  }

  actualizarBotones() {

    this.botones = {
      // Dar asistencia: el turno está con paciente asignado, sin asistencia ==> pasa a estar con paciente asignado, con asistencia
      darAsistencia: this.tienenPacientes() && this.agendaNoSuspendida() && (this.noTienenAsistencia() && this.ningunoConEstado('suspendido')) && this.agendaHoy(),
      // Sacar asistencia: el turno está con paciente asignado, con asistencia ==> pasa a estar "sin asistencia" (mantiene el paciente)
      sacarAsistencia: (this.tienenAsistencia()) && this.tienenPacientes(),
      // Suspender turno: El turno no está asignado ==> el estado pasa a "suspendido"
      suspenderTurno: (this.agendaNoSuspendida() && this.noTienenAsistencia() && this.ningunoConEstado('suspendido') && this.ningunoConEstado('turnoDoble')) && (!this.hayTurnosTarde()),
      // Liberar turno: está "asignado" ==> el estado pasa a "disponible" y se elimina el paciente
      liberarTurno: (this.turnosSeleccionados.length === 1 && this.agendaNoSuspendida() && this.tienenPacientes() && this.noTienenAsistencia() && this.todosConEstado('asignado')),
      // Bloquear turno: está "disponible" pero sin paciente ==> el estado pasa a "suspendido"
      bloquearTurno: this.agendaNoSuspendida() && this.ningunoConEstado('disponible') && !this.tienenPacientes() && (!this.hayTurnosTarde()),
      // Desbloquear turno: está "suspendido" pero sin paciente ==> el estado pasa a "disponible"
      // desbloquearTurno: this.agendaNoSuspendida() && this.todosConEstado('suspendido') && !this.tienenPacientes() && (!this.hayTurnosTarde()),
      // TODO: Reasignar turno: está "asignado" pero sin asistencia ==> *Reunión*
      // reasignarTurno: this.agendaNoSuspendida() && this.todosConEstado('asignado') && this.noTienenAsistencia(),
      reasignarTurno: false,
      // Pasar paciente a la lista de espera: está "asignado" pero sin asistencia ==> Pasa a la "bolsa de gatos"
      listaDeEspera: this.agendaNoSuspendida() && this.todosConEstado('asignado') && this.noTienenAsistencia(),
      // Enviar SMS
      sms: this.agendaNoSuspendida() && this.todosConEstado('asignado') && this.todosConEstado('suspendido') && this.noTienenAsistencia() && (!this.hayTurnosTarde()),

      smsNoEnviado: false,

      nota: this.turnosSeleccionados.length > 0,
      // Se verifica si el siguiente turno se encuentra disponible
      turnoDoble: (this.turnosSeleccionados.length === 1 && this.agendaNoSuspendida() && this.tienenPacientes() && this.noTienenAsistencia() && this.todosConEstado('asignado') && this.siguienteDisponible()),

    };

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

  eventosTurno(operacion) {
    let patch: any = {
      op: operacion,
      turnos: this.turnosSeleccionados
    };

    // Patchea los turnosSeleccionados (1 o más turnos)
    this.serviceAgenda.patchMultiple(this.agenda.id, patch).subscribe(resultado => {
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
    let turnos = this.turnos;
    let turnosActualizar = [];

    for (let x = 0; x < this.turnosSeleccionados.length; x++) {
      // Se busca la posición del turno y se obtiene el siguiente
      turnoSeleccionado = this.turnosSeleccionados[x];
      index = turnos.findIndex(t => { return t._id === turnoSeleccionado._id; });
      if ((index > -1) && (index < turnos.length - 1) && (turnos[index + 1].estado === 'disponible')) {
        turnosActualizar.push(turnos[index + 1]);
      } else {
        // en el caso que el turno siguiente no se encuentre disponible
        this.plex.alert('No se puede asignar el turno doble');
      }
    }

    let patch: any = {
      op: operacion,
      turnos: turnosActualizar
    };

    // Patchea los turnosSeleccionados (1 o más turnos)
    this.serviceAgenda.patchMultiple(this.agenda.id, patch).subscribe(resultado => { this.agenda = resultado; });

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
    this.serviceAgenda.getById(agenda.id).subscribe(ag => {
      this.agenda = ag;
      this.showTurnos = true;
      this.showLiberarTurno = false;
    });
    // this.agenda = agenda;
  }

  saveSuspenderTurno() {
    this.serviceAgenda.getById(this.agenda.id).subscribe(ag => {
      this.agenda = ag;
      this.showTurnos = true;
      this.showSuspenderTurno = false;
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

}
