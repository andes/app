import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacientePortalService } from '../../services/paciente-portal.service';
import { Auth } from '@andes/auth';
import { map } from 'rxjs/operators';

@Component({
    selector: 'pdp-mis-familiares',
    templateUrl: './mis-familiares.component.html'
})
export class PDPMisFamiliaresComponent implements OnInit {

    public selectedId;
    public familiar$;
    public familiares$;
    public paciente;
    public width: number;

    constructor(
        private pacienteService: PacientePortalService,
        private activeRoute: ActivatedRoute,
        private router: Router,
        private auth: Auth,
        private el: ElementRef
    ) {

    }

    ngOnInit(): void {
        this.paciente = this.auth.mobileUser.pacientes[0];
        this.familiares$ = this.pacienteService.getById(this.paciente.id).pipe(
            map(pac => {
                const res = pac.relaciones.map(rel => {
                    rel.id = rel.referencia;
                    delete rel.referencia;
                    return rel;
                });
                return res;
            })
        );
    }

    gotTo(id?) {
        if (id) {
            this.router.navigate([id], { relativeTo: this.activeRoute });
        } else {
            this.router.navigate(['mis-familiares']);
        }
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }
}
