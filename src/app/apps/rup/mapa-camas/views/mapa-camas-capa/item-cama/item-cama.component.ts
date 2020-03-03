import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'tr[app-item-cama]',
    templateUrl: './item-cama.component.html',
})

export class ItemCamaComponent implements OnInit {
    @Input() cama: any;
    @Output() accionCama = new EventEmitter<any>();

    public relacionesPosibles$: Observable<any>;
    public estadoCama$: Observable<any>;

    get sectorCama() {
        return this.cama.sectores[this.cama.sectores.length - 1].nombre;
    }

    constructor(
        public auth: Auth,
        private router: Router,
        private mapaCamasService: MapaCamasService
    ) {
    }

    ngOnInit() {
        this.estadoCama$ = this.mapaCamasService.getEstadoCama(this.cama);
        this.relacionesPosibles$ = this.mapaCamasService.getRelacionesPosibles(this.cama);
    }

    goTo() {
        this.router.navigate([`/internacion/cama/${this.cama._id}`]);
    }

    accion(relacion, $event) {
        $event.stopPropagation();
        this.accionCama.emit(relacion);
    }
}
