import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../services/prestaciones.service';
import { Auth } from '@andes/auth';
@Component({
    selector: 'pdp-mis-turnos-detalle',
    templateUrl: 'mis-turnos-detalles.component.html',
})
export class PDPMisTurnosDetallesComponent implements OnInit {

    public turno$: Observable<any>;

    constructor(
        private prestacionService: PrestacionService,
        private activeRoute: ActivatedRoute,
        private auth: Auth
    ) { }

    ngOnInit() {

        const idPaciente = this.auth.mobileUser.pacientes[0].id;


        this.turno$ = this.activeRoute.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getTurno(params.get('id'), idPaciente))
        );
    }
}
