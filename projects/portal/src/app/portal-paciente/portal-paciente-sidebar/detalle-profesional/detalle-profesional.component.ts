import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Prestacion } from '../../../modelos/prestacion';
import { Profesional } from '../../../modelos/profesional';

@Component({
    selector: 'app-detalle-profesional',
    templateUrl: './detalle-profesional.component.html',
})
export class DetalleProfesionalComponent implements OnInit {

    public selectedId;
    public equipo$;
    public prestaciones$;
    public listadoPrestacion: Prestacion[];
    prestacion$: Observable<Prestacion>;
    profesional$: Observable<Profesional>;

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        this.equipo$ = this.prestacionService.getEquipo();

        //mostrar detalle de prestacion
        this.profesional$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getProfesional(params.get('id')))
        );
    }


}
