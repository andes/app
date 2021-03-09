import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Prestacion } from '../../../modelos/prestacion';
import { Prescripcion } from '../../../modelos/prescripcion';

@Component({
    selector: 'detalle-prescripcion',
    templateUrl: './detalle-prescripcion.component.html',
})
export class DetallePrescripcionComponent implements OnInit {

    public selectedId;
    public prescripciones$;
    public prestaciones$;
    prestacion$: Observable<Prestacion>;
    prescripcion$: Observable<Prescripcion>;

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        this.prescripciones$ = this.prestacionService.getPrescripciones();

        //mostrar detalle de prestacion
        this.prescripcion$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getPrescripcion(params.get('id')))
        );
    }


}
