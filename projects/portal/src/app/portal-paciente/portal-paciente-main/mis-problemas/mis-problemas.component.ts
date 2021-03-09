import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';


@Component({
    selector: 'app-mis-problemas',
    templateUrl: './mis-problemas.component.html',
})
export class MisProblemasComponent implements OnInit {

    public selectedId;
    public problema$;
    public problemas$;
    sidebarValue: number;

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.prestacionService.valorActual.subscribe(valor => this.sidebarValue = valor)

        // Servicios
        this.problemas$ = this.prestacionService.getProblemas();

        //mostrar listado
        this.problema$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getProblema(params.get('id')))
        );
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(9);
    }

    selected(problema) {
        this.nuevoValor();
        problema.selected = !problema.selected;
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = problema.id;
            this.router.navigate(['portal-paciente', { outlets: { detalleProblema: [this.selectedId] } }]);
        }, 500);
    }
}