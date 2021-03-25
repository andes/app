import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../../../services/prestaciones.service';
import { ILaboratorio } from '../../../../interfaces/Ilaboratorio';
import { Auth } from '@andes/auth';
@Component({
    selector: 'pdp-detalle-laboratorio',
    templateUrl: 'detalle-laboratorio.component.html',
})
export class DetalleLaboratorioComponent implements OnInit {

    public selectedId;
    public laboratorios$: Observable<any[]>;
    public listadoLaboratorio: ILaboratorio[];
    public laboratorio$: Observable<any>;


    constructor(
        private laboratorioService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
        private auth: Auth
    ) { }

    ngOnInit() {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        // mostrar detalle de laboratorio
        this.laboratorio$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.laboratorioService.getLaboratorio(params.get('id'), idPaciente))
        );
    }


}
