import { Component, OnInit, ElementRef } from '@angular/core';
import { PrestacionService } from '../../services/prestaciones.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs';

@Component({
    selector: 'pdp-mis-vacunas',
    templateUrl: './mis-vacunas.component.html'
})
export class PDPMisVacunasComponent implements OnInit {
    public vacunas$: Observable<any>;
    public width: number;
    constructor(
        private prestacionService: PrestacionService,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private el: ElementRef,
        private auth: Auth) { }

    ngOnInit(): void {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        // Servicios
        this.vacunas$ = this.prestacionService.getVacunas(idPaciente);
    }


    goTo(id?) {
        if (id) {
            this.router.navigate([id], { relativeTo: this.activeRoute });
        } else {
            this.router.navigate(['mis-vacunas']);
        }
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

}
