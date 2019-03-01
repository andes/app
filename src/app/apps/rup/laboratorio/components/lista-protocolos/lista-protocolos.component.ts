import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'lista-protocolos',
  templateUrl: './lista-protocolos.html',
  styleUrls: ['../../assets/laboratorio.scss']
})
export class ListaProtocolosComponent implements OnInit {

  @Input() protocolos;
  @Input() modo;
  @Input() showProtocoloDetalle;
  @Input() indiceSeleccionado;

  @Output() seleccionarProtocoloEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  /**
   *
   *
   * @param {*} protocolo
   * @param {*} index
   * @memberof ListaProtocolosComponent
   */
  seleccionarProtocolo(protocolo, index) {
    this.indiceSeleccionado = index;
    this.seleccionarProtocoloEmitter.emit({ protocolo: protocolo, index: index });
  }

  /**
   *
   *
   * @param {*} protocolo
   * @param {*} index
   * @memberof ListaProtocolosComponent
   */
  seleccionarProtocoloListaLateral(protocolo, index) {
    if (this.showProtocoloDetalle) {
      this.seleccionarProtocolo(protocolo, index);
    }
  }

  ngOnInit() {
  }
}
