import { Plex } from '@andes/plex';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'detalle-perinatal',
  templateUrl: './detalle-perinatal.component.html'
})
export class DetallePerinatalComponent implements OnInit {
  carnet;
  @Input('carnet')
  set _carnet(value) {
    this.carnet = value;
  }
  ngOnInit(): void {
  }

}
