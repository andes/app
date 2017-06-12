import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { Cie10Service } from './../../../../services/term/cie10.service';
import { enumToArray } from '../../../../utils/enums';
import { EstadosAsistencia } from './../../enums';
import { TurnoService } from './../../../../services/turnos/turno.service';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { PacienteService } from './../../../../services/paciente.service';


@Component({
  selector: 'revision-agenda',
  templateUrl: 'revision-agenda.html'
})

export class RevisionAgendaComponent implements OnInit {
  @HostBinding('class.plex-layout') layout = true;
  private _agenda: any;
  // Parámetros
  @Input('agenda')
  set agenda(value: any) {
    this._agenda = value;
    this.horaInicio = moment(this._agenda.horaInicio).format('dddd').toUpperCase();
    for (let i = 0; i < this.agenda.bloques.length; i++) {
      this.turnos = this.agenda.bloques[i].turnos;
    }
    debugger;
    // this.turnoTipoPrestacion = this.agenda.tipoPrestaciones[0];
  }
  get agenda(): any {
    return this._agenda;
  }

  @Output() volverAlGestor = new EventEmitter<boolean>();
  @Output() selected: EventEmitter<any> = new EventEmitter<any>();
  @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();

  showRevisionAgenda: Boolean = true;
  turnos = [];
  horaInicio: any;
  turnoSeleccionado: any = null;
  bloqueSeleccionado: any = null;
  nuevoCodSecundario: any;
  diagnosticoPrincipal: any;
  paciente: IPaciente;
  cambioTelefono = false;
  showCreateUpdate = false;
  turnoTipoPrestacion: any = {};
  public showRegistrosTurno = false;
  pacientesSearch = false;
  telefono: String = '';
  public seleccion = null;
  public esEscaneado = false;
  public estadosAsistencia = enumToArray(EstadosAsistencia);


  constructor(public plex: Plex,
    public router: Router,
    public auth: Auth,
    private serviceCie10: Cie10Service,
    public serviceTurno: TurnoService,
    public servicePaciente: PacienteService) {
  }

  ngOnInit() {
    if (this.turnoSeleccionado && this.turnoSeleccionado.diagnosticoPrincipal) {
      this.diagnosticoPrincipal = this.turnoSeleccionado.diagnosticoPrincipal;
    } else {
      this.diagnosticoPrincipal = {
        ilegible: false,
        primeraVez: false,
      };
    }
  }

  buscarPaciente() {
    this.showRegistrosTurno = false;
    this.pacientesSearch = true;
  }

  asignarPaciente(paciente) {
    let estado: String = 'asignado';
    let telefono;
    if (paciente.contacto) {
      if (paciente.contacto.length > 0) {
        paciente.contacto.forEach((contacto) => {
          if (contacto.tipo === 'celular') {
            telefono = contacto.valor;
          }
        });
      }
    }
    let pacienteTurno = {
      id: this.paciente.id,
      documento: this.paciente.documento,
      apellido: this.paciente.apellido,
      nombre: this.paciente.nombre,
      telefono: telefono
    };
    if (this.turnoSeleccionado) {
      this.turnoSeleccionado.paciente = pacienteTurno;
      this.turnoSeleccionado.estado = estado;
    }
  }

  afterCreateUpdate(paciente) {
    this.showCreateUpdate = false;
    this.showRegistrosTurno = true;

    if (paciente) {
      this.paciente = paciente;
      // this.asignarPaciente(paciente);
    } else {
      this.buscarPaciente();
    }
  }

  onReturn(paciente: IPaciente): void {
    if (paciente.id) {
      this.paciente = paciente;
      this.showRegistrosTurno = true;
      this.pacientesSearch = false;
      // this.asignarPaciente(paciente);
      window.setTimeout(() => this.pacientesSearch = false, 100);
    } else {
      this.seleccion = paciente;
      this.esEscaneado = true;
      this.escaneado.emit(this.esEscaneado);
      this.selected.emit(this.seleccion);
      this.pacientesSearch = false;
      this.showCreateUpdate = true;
    }
  }


  seleccionarTurno(turno, bloque) {
    this.paciente = null;
    if (this.turnoSeleccionado === turno) {
      this.turnoSeleccionado = null;

    } else {
      this.turnoSeleccionado = turno;
      this.bloqueSeleccionado = bloque;
      this.showCreateUpdate = false;
      this.pacientesSearch = false;
      if (this.turnoSeleccionado.diagnosticoPrincipal) {
        this.diagnosticoPrincipal = this.turnoSeleccionado.diagnosticoPrincipal;
      } else {
        this.diagnosticoPrincipal = {
          ilegible: false,
          primeraVez: false,
        };
      }
    }

  }

  seleccionarAsistencia(asistencia, i) {
    if (this.turnoSeleccionado) {
      this.turnoSeleccionado.asistencia = asistencia.id;
    }
  }

  asistenciaSeleccionada(asistencia) {
    return (this.turnoSeleccionado.asistencia === asistencia.id);
  }

  estaSeleccionado(turno: any) {
    this.showRegistrosTurno = true;
    return this.turnoSeleccionado === turno;
  }

  buscarCodificacion(event) {
    let query = {
      nombre: event.query
    };
    if (event.query && event.query !== '') {
      this.serviceCie10.get(query).subscribe(event.callback);
    }
  }

  agregarDiagnosticoSecundario() {
    let nuevoDiagnostico = { codificacion: null };
    if (this.nuevoCodSecundario) {
      nuevoDiagnostico.codificacion = this.nuevoCodSecundario;
      this.turnoSeleccionado.diagnosticoSecundario.push(nuevoDiagnostico);
    }
  }

  borrarDiagnostico(index) {
    this.turnoSeleccionado.diagnosticoSecundario.splice(index, 1);
  }


  marcarIlegible() {
    if (this.diagnosticoPrincipal.ilegible) {
      this.diagnosticoPrincipal.codificacion = null;
      this.diagnosticoPrincipal.primeraVez = false;
    }
  }

  cancelar() {
    this.turnoSeleccionado = null;
  }

  onSave() {
    // Se guarda el turno seleccionado
    if (this.paciente) {
      this.asignarPaciente(this.paciente);
    }

    if (this.turnoTipoPrestacion) {
      this.turnoSeleccionado.tipoPrestacion = this.turnoTipoPrestacion;
    };

    if (this.diagnosticoPrincipal) {
      this.turnoSeleccionado.diagnosticoPrincipal = this.diagnosticoPrincipal;
    }

    let datosTurno = {
      idAgenda: this.agenda.id,
      idTurno: this.turnoSeleccionado.id,
      idBloque: this.bloqueSeleccionado.id,
      turno: this.turnoSeleccionado,
    };

    if (this.turnoSeleccionado.tipoPrestacion) {
      this.serviceTurno.put(datosTurno).subscribe(resultado => {
        this.plex.toast('success', 'Información', 'La información del turno fue actualizada');
        this.turnoSeleccionado = null;
      });
    } else {
      this.plex.alert('Debe seleccionar un tipo de Prestacion');
    }
  }

  volver() {
    this.volverAlGestor.emit(true);

  }

}
