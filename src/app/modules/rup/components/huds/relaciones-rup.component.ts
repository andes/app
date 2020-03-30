import { Component, Input } from '@angular/core';

@Component({
    selector: 'rup-relaciones',
    templateUrl: './relaciones-rup.html',
    styleUrls: ['./relaciones-rup.scss']
})
export class RupRelacionesComponent {

    @Input() registrosRelaciones;

    constructor() { }


}
