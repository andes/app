import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Auth } from '@andes/auth';
import { CertificadoService } from '../../services/certificado.service';
@Component({
    selector: 'pdp-mis-certificados-detalle',
    templateUrl: './mis-certificados-detalle.component.html'
})
export class PDPMisCertificadoDetalleComponent implements OnInit {

    public certificado$: Observable<any>;

    constructor(
        private certificadoService: CertificadoService,
        private activeRoute: ActivatedRoute,
        private auth: Auth,
        private router: Router,
        private el: ElementRef
    ) { }

    ngOnInit() {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        // mostrar detalle de laboratorio
        this.certificado$ = this.activeRoute.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.certificadoService.getCertificado(params.get('id'), idPaciente))
        );
    }


    goTo() {
        this.router.navigate(['mis-certificados']);
    }

    isResponsive() {
        const width = this.el.nativeElement.clientWidth;
        return width >= 980;
    }

    descargar(certificado) {
        this.certificadoService.descargar(certificado);
    }



}
