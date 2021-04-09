import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../services/prestaciones.service';
import { Auth } from '@andes/auth';
import { environment } from '../../../environments/environment';
@Component({
    selector: 'pdp-mis-laboratorios-detalle',
    templateUrl: './mis-laboratorios-detalle.component.html'
})
export class PDPMisLaboratoriosDetalleComponent implements OnInit {

    public laboratorios$: Observable<any[]>;
    public laboratorio$: Observable<any>;
    public width: number;
    constructor(
        private laboratorioService: PrestacionService,
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
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

    descargar(cda) {
        if (cda.confidentialityCode !== 'R') {
            const url = environment.API + '/modules/cda/' + cda.adjuntos[0] + '?token=' + this.auth.getToken();
            window.open(url);
        }
    }



}
