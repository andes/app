import { OnInit, Component } from '@angular/core';


@Component({
    selector: 'gestor-derivaciones',
    templateUrl: 'gestor-derivaciones.html'
})

export class LaboratorioDerivacionesComponent implements OnInit {
    accionIndex = 0;
    constructor(
    ) { }

    ngOnInit() {
    }

    onTabChange($event) {
    }
}

