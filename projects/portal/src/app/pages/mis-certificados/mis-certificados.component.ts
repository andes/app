import { Component, OnInit, ElementRef } from '@angular/core';
import { CertificadoService } from '../../services/certificado.service';
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
        private certificadoService: CertificadoService,
        private activeRoute: ActivatedRoute,
        private router: Router,
        private el: ElementRef,
        private auth: Auth
    ) { }


    ngOnInit(): void {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;

        this.certificados$ = this.certificadoService.getCertificados(idPaciente);

    }


    goTo(id?) {
        if (id) {
            this.router.navigate([id], { relativeTo: this.activeRoute });
        } else {
            this.router.navigate(['mis-certificados']);
        }
    }

    isResponsive() {
        const width = this.el.nativeElement.clientWidth;
        return width >= 980;
    }

    descargar(certificado) {
        this.certificadoService.descargar(certificado);
    }

}
