import { Component, Input } from '@angular/core';

@Component({
  selector: 'historial-perinatal',
  templateUrl: './historial-perinatal.component.html'
})
export class HistorialPerinatalComponent {
  @Input() controles: any;
}
