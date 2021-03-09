import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-mis-vacunas',
    templateUrl: './mis-vacunas.component.html',
})
export class MisVacunasComponent implements OnInit {

    public selectedId;
    public vacuna$;
    public vacunas$;

    sidebarValue: number;
    @Output() eventoSidebar = new EventEmitter<number>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,) { }

    ngOnInit(): void {
        this.prestacionService.valorActual.subscribe(valor => this.sidebarValue = valor)

        // Servicios
        this.vacunas$ = this.prestacionService.getVacunas();

        //mostrar listado (vacunas, historia, labs)
        this.vacuna$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getVacuna(params.get('id')))
        );
    }

    selected(vacuna) {
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = vacuna.id;
            this.router.navigate(['portal-paciente', { outlets: { detalleVacuna: [this.selectedId] } }]);
        }, 500);
    }
}

