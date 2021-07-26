import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacientePortalService } from '../../services/paciente-portal.service';

@Component({
    selector: 'pdp-mis-relaciones',
    templateUrl: './mis-relaciones.component.html'
})
export class PDPMisRelacionesComponent implements OnInit {

    public selectedId;
    public familiares;
    public width: number;

    constructor(
        private activeRoute: ActivatedRoute,
        private router: Router,
        private el: ElementRef,
        private pacienteService: PacientePortalService
    ) {

    }

    ngOnInit(): void {
        this.pacienteService.me().subscribe(paciente => {
            this.familiares = paciente.relaciones?.map(rel => {
                rel.id = rel.referencia;
                return rel;
            });
        });
    }

    goTo(id?) {
        if (id) {
            this.router.navigate([id], { relativeTo: this.activeRoute });
        } else {
            this.router.navigate(['mis-relaciones']);
        }
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }
}
