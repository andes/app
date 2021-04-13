import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LaboratorioService } from '../../services/laboratorio.service';
import { Auth } from '@andes/auth';
@Component({
    selector: 'pdp-mis-laboratorios-detalle',
    templateUrl: './mis-laboratorios-detalle.component.html'
})
export class PDPMisLaboratoriosDetalleComponent implements OnInit {

    public laboratorio$: Observable<any>;

    constructor(
        private laboratorioService: LaboratorioService,
        private activeRoute: ActivatedRoute,
        private auth: Auth,
        private router: Router,
        private el: ElementRef
    ) { }

    ngOnInit() {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        // mostrar detalle de laboratorio
        this.laboratorio$ = this.activeRoute.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.laboratorioService.getLaboratorio(params.get('id'), idPaciente))
        );
    }


    goTo() {
        this.router.navigate(['mis-laboratorios']);
    }

    isResponsive() {
        const width = this.el.nativeElement.clientWidth;
        return width >= 980;
    }

    descargar(cda) {
        this.laboratorioService.descargar(cda);
    }



}
