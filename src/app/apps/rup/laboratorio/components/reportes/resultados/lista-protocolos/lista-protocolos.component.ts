import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'reportes-resultado-lista-protocolos',
  templateUrl: './lista-protocolos.html',
  styleUrls: ['../../../../assets/laboratorio.scss']
})
export class ReportesResultadoListaProtocolosComponent implements OnInit {
  @Input() protocolos;
  @Input() idsProtocolosSeleccionados;
  @Output() descargarReportesEmmiter: EventEmitter<any> = new EventEmitter<any>();
  showBotonDescargar: Boolean = false;
  marcarTodas: Boolean = false;

  constructor() { }

  ngOnInit() {
  }

  /**
   *
   *
   * @memberof ReportesResultadoListaProtocolosComponent
   */
  descargarReportesClick() {
    this.descargarReportesEmmiter.emit();
  }

  /**
   *
   *
   * @param {*} $event
   * @memberof ReportesResultadoListaProtocolosComponent
   */
  checkAllChange(event) {
    Object.keys(this.idsProtocolosSeleccionados).forEach( key => this.idsProtocolosSeleccionados[key] = event.value );
    this.refreshBotonDescargar();
  }

  /**
   *
   *
   * @param {*} event
   * @param {*} protocoloId
   * @memberof ReportesResultadoListaProtocolosComponent
   */
  refreshBotonDescargar() {
    const arr = this.idsProtocolosSeleccionados;
    this.showBotonDescargar = Object.keys(arr).some( (key) => arr[key] );
  }
}
