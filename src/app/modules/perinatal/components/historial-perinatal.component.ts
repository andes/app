import { Component, Input } from '@angular/core';

@Component({
  selector: 'historial-perinatal',
  templateUrl: './historial-perinatal.component.html'
})
export class HistorialPerinatalComponent {
  controles;
  @Input('controles')
  set _carnet(value) {
    this.controles = value;
  }
}
