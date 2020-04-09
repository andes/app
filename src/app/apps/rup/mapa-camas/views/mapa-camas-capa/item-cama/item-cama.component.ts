import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Observable, combineLatest, Subject, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PrestacionesService } from '../../../../../../modules/rup/services/prestaciones.service';
import { ISnapshot } from '../../../interfaces/ISnapshot';

@Component({
    selector: 'tr[app-item-cama]',
    templateUrl: './item-cama.component.html',
})

export class ItemCamaComponent implements OnInit {
    @Input() cama: any;
    @Input() capa: any;
    @Input() permisoIngreso: boolean;
    @Output() accionCama = new EventEmitter<any>();

    // public capa: string;
    public relacionesPosibles$: Observable<any>;
    public estadoCama$: Observable<any>;
    public puedeDesocupar$: Observable<string>;

    get sectorCama() {
        return this.cama.sectores[this.cama.sectores.length - 1].nombre;
    }

    constructor(
        public auth: Auth,
        private router: Router,
        private mapaCamasService: MapaCamasService,
        private prestacionService: PrestacionesService
    ) {
    }

    ngOnInit() {
        this.estadoCama$ = this.mapaCamasService.getEstadoCama(this.cama);
        this.relacionesPosibles$ = this.mapaCamasService.getRelacionesPosibles(this.cama);

        // this.capa = this.mapaCamasService.capa;
        // if (this.capa === 'estadistica') {
        //     if (this.cama.estado === 'ocupada') {
        //         this.prestacionService.getById(this.cama.idInternacion).subscribe(prestacion => {
        //             this.puedeDesocupar$ = this.mapaCamasService.verificarCamaDesocupar(this.cama, prestacion);
        //         });
        //     }
        // }
    }

    goTo() {
        this.router.navigate([`/internacion/cama/${this.cama._id}`]);
    }

    accion(relacion, $event) {
        $event.stopPropagation();
        this.accionCama.emit(relacion);
    }
}
