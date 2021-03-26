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
    mainValue: number;

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.prestacionService.valorActual.subscribe(valor => this.mainValue = valor);

        // Servicios
        this.problemas$ = this.prestacionService.getProblemas();

        // Mostrar listado
        this.problema$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getProblema(params.get('id')))
        );
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(9);
    }

    mostrarSidebar() {
        this.prestacionService.actualizarSidebar(true);
    }

    cambiaFoco() {
        this.prestacionService.actualizarFoco('sidebar');
    }

    selected(problema) {
        this.nuevoValor();
        this.cambiaFoco();
        this.mostrarSidebar();
        problema.selected = !problema.selected;
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = problema.id;
            this.router.navigate(['portal-paciente', { outlets: { detalleProblema: [this.selectedId] } }]);
        }, 500);
    }
}
