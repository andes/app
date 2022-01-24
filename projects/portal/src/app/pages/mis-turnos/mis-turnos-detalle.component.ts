import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TurnoService } from '../../services/turno.service';

@Component({
    selector: 'pdp-mis-turnos-detalle',
    templateUrl: 'mis-turnos-detalles.component.html',
})
export class PDPMisTurnosDetallesComponent implements OnInit {

    public turno$: Observable<any>;
    public width: number;
    public fecha = new Date();
    constructor(
        private turnoService: TurnoService,
        private activeRoute: ActivatedRoute,
        private router: Router,
        private el: ElementRef
    ) { }

    ngOnInit() {
        this.turno$ = this.activeRoute.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.turnoService.getTurno(params.get('id')))
        );
    }

    goTo() {
        this.router.navigate(['mis-turnos']);
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }
    linkVideollamada(link) {
        window.open(link);
    }
}
