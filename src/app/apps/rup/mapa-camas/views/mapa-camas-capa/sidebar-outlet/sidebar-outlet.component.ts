import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { IMAQRelacion } from '../../../interfaces/IMaquinaEstados';

import { MapaCamasService } from '../../../services/mapa-camas.service';

@Component({
    selector: 'in-sidebar-outlet',
    templateUrl: './sidebar-outlet.component.html',
})
export class INSidebarOutletComponent {
    public action$: Observable<string> = null;
    public cambiarUO = false;
    public relacion$: Observable<IMAQRelacion> = null;
    public selectedCama$ = this.mapaCamasService.selectedCama;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private mapaCamasService: MapaCamasService,
        private location: Location
    ) {

        this.action$ = this.route.params.pipe(pluck('action'));

        // [TODO] Esta relacion no es suficiente
        this.relacion$ = combineLatest([
            this.action$,
            this.mapaCamasService.relaciones$
        ]).pipe(
            map(([action, relaciones]) => {
                return relaciones.find(rel => rel.accion === action);
            })
        );
    }

    accionDesocupar(accion) {
        if (!accion.egresar) {
            this.cambiarUO = accion.cambiarUO;
            this.router.navigate(['..', 'cambiarCama'], { relativeTo: this.route });
        } else {
            this.router.navigate(['..', accion.egresar], { relativeTo: this.route });
        }
    }

    volverADetalle() {
        this.location.back();
    }

    back() {
        this.location.back();
    }

    volverADesocupar() {
        this.router.navigate(['..', 'desocuparCama'], { relativeTo: this.route });
    }

    volverAResumen() {
        this.location.back();
        this.mapaCamasService.select(null);
    }

    selectCama(cama, relacion) {
        this.mapaCamasService.resetView();
        this.mapaCamasService.select(cama);
        if (relacion) {
            this.router.navigate(['..', relacion.accion], { relativeTo: this.route });
        }
    }

}
