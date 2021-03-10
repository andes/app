import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Laboratorio } from '../../../modelos/laboratorio';

@Component({
    selector: 'app-detalle-laboratorio',
    templateUrl: './detalle-laboratorio.component.html',
})
export class DetalleLaboratorioComponent implements OnInit {

    public selectedId;
    public laboratorios$;
    public listadoLaboratorio: Laboratorio[];
    laboratorio$: Observable<Laboratorio>;


    constructor(
        private laboratorioService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        this.laboratorios$ = this.laboratorioService.getLaboratorios();

        // Mostrar detalle de laboratorio
        this.laboratorio$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.laboratorioService.getLaboratorio(params.get('id')))
        );
    }

    gotoLaboratorioes(laboratorio: Laboratorio) {
        const laboratorioId = laboratorio ? laboratorio.id : null;
        this.router.navigate(['/portal-paciente-sidebar', { id: laboratorioId }]);
    }
}
