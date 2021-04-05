import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../services/prestaciones.service';
import { Auth } from '@andes/auth';
@Component({
    selector: 'pdp-detalle-vacuna',
    templateUrl: './mis-vacunas-detalle.component.html',
})
export class PDPDetalleVacunaComponent implements OnInit {



    vacuna$: Observable<any>;



    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private auth: Auth
    ) { }

    ngOnInit() {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        // mostrar detalle de prestacion
        this.vacuna$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getVacuna(params.get('id'), idPaciente))
        );
    }


}
