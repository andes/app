import { PrestacionesService } from './../../../../../../modules/rup/services/prestaciones.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IPrestacion } from '../../../../../../interfaces/turnos/IPrestacion';


@Component({
  selector: 'punto-inicio-listado-solicitudes',
  templateUrl: './listado-solicitudes.html'
})
export class ListadoSolicitudesComponent implements OnInit {

  @Input('paciente')
  set paciente(value: any) {
    if (value) {
      this.buscarSolicitudes();
    }
  };
  public protocolos: any[];

  constructor(
    public servicioPrestaciones: PrestacionesService
  ) { }

  // seleccionarProtocolo(protocolo, index) {
  //   this.seleccionarProtocoloEmitter.emit({protocolo: protocolo, index: index});
  // }

  ngOnInit() {
  }

  /**
   * 
   * 
   * @param {any} [value] 
   * @param {any} [tipo] 
   * @memberof ListadoSolicitudesComponent
   */
  buscarSolicitudes(value?, tipo?) {
    let params = {
      estado: ['pendiente'],
      pacienteDocumento: this.paciente.documento
    }
    // params.organizacion = Auth.getOrganizacion();

    this.servicioPrestaciones.get(params).subscribe(protocolos => {
      this.protocolos = protocolos;
      // }
      // , err => {
      //   if (err) {
      //     this.plex.info('danger', err);
      //   }
    });
  }
}
