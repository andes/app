import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'reportes-resultado-lista-protocolos',
  templateUrl: './lista-protocolos.html',
  styleUrls: ['../../../../assets/laboratorio.scss']
})
export class ReportesResultadoListaProtocolosComponent implements OnInit {
  @Input() protocolos;
  @Input() modo;
  @Input() showProtocoloDetalle;
  @Output() seleccionarProtocoloEmitter: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  seleccionarProtocolo(protocolo, index) {
    this.seleccionarProtocoloEmitter.emit({ protocolo: protocolo, index: index });
  }

  ngOnInit() {
  }
}
