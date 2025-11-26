import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../../services/mapa-camas.service';

@Component({
    selector: 'tr[app-item-inconsistencia]',
    templateUrl: './item-inconsistencia.component.html',
})

export class ItemInconsistenciaComponent {
    @Input() inconsistencia: any;

    constructor(
        public auth: Auth,
        private router: Router,
        private mapaCamasService: MapaCamasService,
    ) {
    }

}
