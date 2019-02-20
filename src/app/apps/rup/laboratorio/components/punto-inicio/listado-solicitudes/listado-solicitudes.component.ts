import { LaboratorioContextoCacheService } from './../../../services/protocoloCache.service';
import { TurnoService } from './../../../../../../services/turnos/turno.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IPaciente } from '../../../../../../interfaces/IPaciente';
import { Router } from '@angular/router';
@Component({
  selector: 'punto-inicio-listado-solicitudes',
  templateUrl: './listado-solicitudes.html',
})
export class ListadoSolicitudesComponent implements OnInit {
  @Output() seleccionarProtocoloEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() pacienteConTurnoEmitter: EventEmitter<any> = new EventEmitter<any>();
  paciente: IPaciente;
  @Input('paciente')
  set setpaciente(value: any) {
    this.paciente = value;
    if (value) {
      this.buscarSolicitudes(value);
    }
  }

  public turnos: any[];
  public modo = 'puntoInicio';

  constructor(
    public turnoService: TurnoService,
    public laboratorioContextoCacheService: LaboratorioContextoCacheService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  /**
   *
   * @param {any} [paciente]
   * @memberof ListadoSolicitudesComponent
   */
  buscarSolicitudes(paciente) {
    this.turnoService.get({ pacienteId: paciente._id, tipoPrestacion: '15220000' }).subscribe(turnos => {
      this.turnos = turnos;
    });
  }

  /**
   *
   *
   * @param {*} $event
   * @memberof ListadoSolicitudesComponent
   */
  seleccionarProtocolo($event) {
    this.seleccionarProtocoloEmitter.emit($event);
  }

  /**
   *
   *
   * @memberof ListadoSolicitudesComponent
   */
  recepcionar(value) {
    console.log(value);
    this.laboratorioContextoCacheService.modoRecepcion();
    this.pacienteConTurnoEmitter.emit(value);
  }
}
