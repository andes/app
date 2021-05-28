import { Component, OnInit, ElementRef } from '@angular/core';
import { TurnoService } from '../../services/turno.service';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
    selector: 'pdp-mis-turnos',
    templateUrl: 'mis-turnos.component.html',
})
export class PDPMisTurnosComponent implements OnInit {

    public width: number;
    public turnos$: Observable<any>;


    constructor(
        private turnoService: TurnoService,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private el: ElementRef) { }

    ngOnInit(): void {
        this.turnos$ = this.turnoService.getTurnos().pipe(
            map(turnos => this.sortTurnos(turnos))
        );
    }

    private sortTurnos(turnos) {
        turnos = turnos.sort((a, b) => {
            const inia = a.horaInicio ? new Date(a.horaInicio) : null;
            const inib = b.horaInicio ? new Date(b.horaInicio) : null;
            {
                return ((inia && inib) ? (inib.getTime() - inia.getTime()) : 0);
            }
        });
        return turnos;
    }

    goTo(id?) {
        if (id) {
            this.router.navigate([id], { relativeTo: this.activeRoute });
        } else {
            this.router.navigate(['mis-turnos']);
        }
    }
    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

}