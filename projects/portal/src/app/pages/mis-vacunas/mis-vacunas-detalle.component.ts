import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { VacunaService } from '../../services/vacuna.service';
import { Auth } from '@andes/auth';
@Component({
    selector: 'pdp-detalle-vacuna',
    templateUrl: './mis-vacunas-detalle.component.html',
})
export class PDPDetalleVacunaComponent implements OnInit {

    vacuna$: Observable<any>;
    public width: number;

    constructor(
        private vacunaService: VacunaService,
        private activeRoute: ActivatedRoute,
        private auth: Auth,
        private router: Router,
        private el: ElementRef
    ) { }

    ngOnInit() {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        // mostrar detalle de prestacion
        this.vacuna$ = this.activeRoute.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.vacunaService.getVacuna(params.get('id'), idPaciente))
        );
    }

    goTo() {

        this.router.navigate(['mis-vacunas']);

    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

}
