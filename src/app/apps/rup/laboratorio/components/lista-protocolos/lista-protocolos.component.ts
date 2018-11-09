import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'lista-protocolos',
  templateUrl: './lista-protocolos.html',
  styleUrls: ['./lista-protocolos.component.css']
})
export class ListaProtocolosComponent implements OnInit {

  @Input() protocolos;
  @Input() modo;
  @Input() showProtocoloDetalle;
  @Output() seleccionarProtocoloEmitter: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  seleccionarProtocolo(protocolo, index) {
    this.seleccionarProtocoloEmitter.emit({protocolo: protocolo, index: index});
  }

  ngOnInit() {
  }
}
