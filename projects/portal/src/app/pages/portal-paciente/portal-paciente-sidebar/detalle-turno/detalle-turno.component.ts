import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { PrestacionService } from '../../../../services/prestaciones.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'pdp-detalle-turno',
    templateUrl: './detalle-turno.component.html',
})
export class DetalleTurnoComponent implements OnInit {

    public selectedId;
    public turno$: Observable<any>;
    public prestaciones$;


    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
        private auth: Auth
    ) { }

    ngOnInit() {

        const idPaciente = this.auth.mobileUser.pacientes[0].id;


        this.turno$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getTurno(params.get('id'), idPaciente)),
            map(g => g[0].turnos[0])
        );
    }


}
