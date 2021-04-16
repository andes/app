import { Component, OnInit, ElementRef } from '@angular/core';
import { LaboratorioService } from '../../services/laboratorio.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs';
@Component({
    selector: 'pdp-mis-certificados',
    templateUrl: './mis-certificados.component.html'
})
export class PDPMisCertificadosComponent implements OnInit {

    public certificados$: Observable<any[]>;

    constructor(
        private laboratorioService: LaboratorioService,
        private activeRoute: ActivatedRoute,
        private router: Router,
        private el: ElementRef,
        private auth: Auth
    ) { }


    ngOnInit(): void {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;

        this.certificados$ = this.laboratorioService.getLaboratorios(idPaciente);

    }


    goTo(id?) {
        if (id) {
            this.router.navigate([id], { relativeTo: this.activeRoute });
        } else {
            this.router.navigate(['mis-laboratorios']);
        }
    }

    isResponsive() {
        const width = this.el.nativeElement.clientWidth;
        return width >= 980;
    }

    descargar(cda) {
        this.laboratorioService.descargar(cda);
    }

}
