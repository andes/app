import { Component, OnInit, ElementRef } from '@angular/core';
import { PrestacionService } from '../../services/prestaciones.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs';

@Component({
    selector: 'pdp-mis-laboratorios',
    templateUrl: './mis-laboratorios.component.html'
})
export class PDPMisLaboratoriosComponent implements OnInit {
    public selectedId;
    public laboratorio$: Observable<any>;
    public laboratorios$: Observable<any[]>;

    public vacunas$: Observable<any>;
    public width: number;
    constructor(
        private prestacionService: PrestacionService,
        private activeRoute: ActivatedRoute,
        private router: Router,
        private el: ElementRef,
        private auth: Auth) { }


    ngOnInit(): void {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        // Servicios
        this.laboratorios$ = this.prestacionService.getLaboratorios(idPaciente);

        // mostrar listado
        this.laboratorio$ = this.activeRoute.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getLaboratorio(params.get('id'), idPaciente))
        );
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

}
