import { Component, Input } from '@angular/core';

@Component({
    selector: 'detalle-perinatal',
    templateUrl: './detalle-perinatal.component.html'
})
export class DetallePerinatalComponent {
    @Input() carnet: any;
}
