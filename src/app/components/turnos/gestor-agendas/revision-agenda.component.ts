import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { Cie10Service } from './../../../services/term/cie10.service';
import {enumToArray} from '../../../utils/enums';
import { EstadosAsistencia } from './../enums';


@Component({
  selector: 'revision-agenda',
  templateUrl: 'revision-agenda.html'
})

export class RevisionAgendaComponent implements OnInit {

  private _agenda: any;
  // Parámetros
  @Input('agenda')
  set agenda(value: any) {
    this._agenda = value;
    this.horaInicio = moment(this._agenda.horaInicio).format('dddd').toUpperCase();
    for (let i = 0; i < this.agenda.bloques.length; i++) {
      this.turnos = this.agenda.bloques[i].turnos;
    }
  }
  get agenda(): any {
    return this._agenda;
  }

  showRevisionAgenda: Boolean = true;
  turnos = [];
  horaInicio: any;
  turnoSeleccionado: any = null;
  asistio = false;
  noAsistio = false;
  sinDatos = false;
  nuevoCodSecundario: any;
  diagnosticoPrincipal: any;
  public estadosAsistencia = enumToArray(EstadosAsistencia);
  tiposAsistencia = enumToArray(EstadosAsistencia);
  asistencia = [false, false, false];

  constructor(public plex: Plex, public router: Router, public auth: Auth, private serviceCie10: Cie10Service) {
  }

  ngOnInit() {
  }

  seleccionarTurno(turno) {
    if (this.turnoSeleccionado === turno) {
      this.turnoSeleccionado = null;
    } else {
      this.turnoSeleccionado = turno;
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

  marcarAsistencia(asistencia, i){
    debugger;
    if (this.turnoSeleccionado){
      this.turnoSeleccionado.asistencia = this.tiposAsistencia[i].id;
      this.asistencia[i] = true;
    }
  }

  asistenciaSeleccionada(estado){
    return false;
  }


  estaSeleccionado(turno: any) {
    return this.turnoSeleccionado == turno; // .indexOf(turno) >= 0;
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
    debugger;
    this.turnoSeleccionado.diagnosticoSecundario.splice(index, 1);
  }


  marcarIlegible() {
    if (this.diagnosticoPrincipal.ilegible) {
      this.diagnosticoPrincipal.codificacion = null;
      this.diagnosticoPrincipal.primeraVez = false;
    }
  }

}
