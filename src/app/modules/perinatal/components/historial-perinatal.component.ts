import { Plex } from '@andes/plex';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'historial-perinatal',
  templateUrl: './historial-perinatal.component.html'
})
export class HistorialPerinatalComponent implements OnInit {
  controles;
  @Input('controles')
  set _carnet(value) {
    this.controles = value;
  }

  ngOnInit(): void {
  }

}
