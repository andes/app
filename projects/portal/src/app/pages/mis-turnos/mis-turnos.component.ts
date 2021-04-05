import { Component, OnInit, ElementRef } from '@angular/core';
import { PrestacionService } from '../../services/prestaciones.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs';
@Component({
    selector: 'pdp-mis-turnos',
    templateUrl: 'mis-turnos.component.html',
})
export class PDPMisTurnosComponent implements OnInit {

    public width: number;
    public turnos$: Observable<any>;

    constructor(
        private prestacionService: PrestacionService,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private auth: Auth,
        private el: ElementRef) { }

    ngOnInit(): void {
        // Servicios
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        this.turnos$ = this.prestacionService.getTurnos(idPaciente);
    }

    goTo(id?) {
        if (id) {
            this.router.navigate([id], { relativeTo: this.activeRoute });

        } else {
            this.router.navigate(['mis-turnos']);
        }
    }
    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

}
