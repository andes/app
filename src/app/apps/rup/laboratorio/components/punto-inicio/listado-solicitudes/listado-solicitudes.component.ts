import { PrestacionesService } from './../../../../../../modules/rup/services/prestaciones.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IPaciente } from '../../../../../../interfaces/IPaciente';

@Component({
  selector: 'punto-inicio-listado-solicitudes',
  templateUrl: './listado-solicitudes.html',
})
export class ListadoSolicitudesComponent implements OnInit {
  @Output() seleccionarProtocoloEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() pacienteSinTurnoEmitter: EventEmitter<any> = new EventEmitter<any>();
  paciente: IPaciente;
  @Input('paciente')
  set setpaciente(value: any) {
    this.paciente = value;
    if (value) {
      this.buscarSolicitudes(value);
    }
  }

  public protocolos: any[];
  public modo = 'puntoInicio';

  constructor(
    public servicioPrestaciones: PrestacionesService
  ) { }

  ngOnInit() {
  }

  /**
   *
   * @param {any} [paciente]
   * @memberof ListadoSolicitudesComponent
   */
  buscarSolicitudes(paciente) {
    let params = {
      estado: ['pendiente'],
      pacienteDocumento: paciente.documento,
      tipoPrestacionSolicititud: '15220000'
    };

    this.servicioPrestaciones.get(params).subscribe(protocolos => {
      this.protocolos = protocolos;
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

}
