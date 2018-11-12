import { PrestacionesService } from './../../../../../../modules/rup/services/prestaciones.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'punto-inicio-listado-solicitudes',
  templateUrl: './listado-solicitudes.html'
})
export class ListadoSolicitudesComponent implements OnInit {
  @Output() seleccionarProtocoloEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Input('paciente')
  set paciente(value: any) {
    console.log('set paciente')
    if (value) {
      this.buscarSolicitudes(value);
    }
  };

  public protocolos: any[];
  public modo = "puntoInicio";

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
    }

    this.servicioPrestaciones.get(params).subscribe(protocolos => {
      this.protocolos = protocolos;
    });
  }

  seleccionarProtocolo($event) {
    this.seleccionarProtocoloEmitter.emit($event);
  }
}
