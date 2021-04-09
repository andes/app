import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../services/prestaciones.service';

@Component({
    selector: 'pdp-mis-turnos-detalle',
    templateUrl: 'mis-turnos-detalles.component.html',
})
export class PDPMisTurnosDetallesComponent implements OnInit {

    public turno$: Observable<any>;
    public width: number;
    constructor(
        private prestacionService: PrestacionService,
        private activeRoute: ActivatedRoute,
        private router: Router,
        private el: ElementRef

    ) { }

    ngOnInit() {
        this.turno$ = this.activeRoute.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getTurno(params.get('id')))
        );
    }




    goTo() {

        this.router.navigate(['mis-turnos']);
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }
}
