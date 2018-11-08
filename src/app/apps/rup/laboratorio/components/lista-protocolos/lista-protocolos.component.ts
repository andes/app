import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'lista-protocolos',
  templateUrl: './lista-protocolos.html',
  styleUrls: ['./lista-protocolos.component.css']
})
export class ListaProtocolosComponent implements OnInit {

  @Input() protocolos;
  @Input() modo;
  @Output() seleccionarProtocoloEmitter: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  seleccionarProtocolo(protocolo, index) {
    console.log('seleccionarProtocolo')
    this.seleccionarProtocoloEmitter.emit({protocolo: protocolo, index: index});
  }

  ngOnInit() {
  }
}
