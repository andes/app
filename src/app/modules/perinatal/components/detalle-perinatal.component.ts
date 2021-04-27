import { Component, Input } from '@angular/core';

@Component({
  selector: 'detalle-perinatal',
  templateUrl: './detalle-perinatal.component.html'
})
export class DetallePerinatalComponent {
  carnet;
  @Input('carnet')
  set _carnet(value) {
    this.carnet = value;
  }
}
