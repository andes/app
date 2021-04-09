import { Component, OnInit, ElementRef } from '@angular/core';
import { PrestacionService } from '../../services/prestaciones.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Component({
    selector: 'pdp-mis-laboratorios',
    templateUrl: './mis-laboratorios.component.html'
})
export class PDPMisLaboratoriosComponent implements OnInit {

    public laboratorios$: Observable<any[]>;


    public width: number;
    constructor(
        private prestacionService: PrestacionService,
        private activeRoute: ActivatedRoute,
        private router: Router,
        private el: ElementRef,

        private auth: Auth) { }


    ngOnInit(): void {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;

        this.laboratorios$ = this.prestacionService.getLaboratorios(idPaciente);

    }


    goTo(id?) {
        if (id) {
            this.router.navigate([id], { relativeTo: this.activeRoute });
        } else {
            this.router.navigate(['mis-laboratorios']);
        }
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
