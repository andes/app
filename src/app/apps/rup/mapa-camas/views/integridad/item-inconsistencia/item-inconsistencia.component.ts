import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable } from 'rxjs';
import { aporteOxigeno, respirador, monitorTelemetrico, monitorFisiologico } from '../../../constantes-internacion';

@Component({
    selector: 'tr[app-item-inconsistencia]',
    templateUrl: './item-inconsistencia.component.html',
})

export class ItemInconsistenciaComponent implements OnInit {
    @Input() inconsistencia: any;

    constructor(
        public auth: Auth,
        private router: Router,
        private mapaCamasService: MapaCamasService,
    ) {
    }

    ngOnInit() {

    }
}
