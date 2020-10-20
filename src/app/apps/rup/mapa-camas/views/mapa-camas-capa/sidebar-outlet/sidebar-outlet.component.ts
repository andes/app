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
        private mapaCamasService: MapaCamasService
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

            // this.action = 'cambiarCama';
        } else {
            this.router.navigate(['..', accion.egresar], { relativeTo: this.route });

            // this.action = accion.egresar;
        }
    }

    volverADetalle() {
        this.router.navigate(['..', 'verDetalle'], { relativeTo: this.route });
    }

    bakc() {
        this.router.navigate(['..'], { relativeTo: this.route });
    }

    volverADesocupar() {
        this.router.navigate(['..', 'desocuparCama'], { relativeTo: this.route });
    }

    volverAResumen() {
        this.router.navigate(['..'], { relativeTo: this.route });
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
