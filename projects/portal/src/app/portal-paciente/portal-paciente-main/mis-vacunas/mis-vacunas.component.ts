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

    mainValue: number;
    @Output() eventoSidebar = new EventEmitter<number>();
    @Output() eventoFoco = new EventEmitter<string>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
        this.prestacionService.valorActual.subscribe(valor => this.mainValue = valor);

        // Servicios
        this.vacunas$ = this.prestacionService.getVacunas();

        // Mostrar listado (vacunas, historia, labs)
        this.vacuna$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getVacuna(params.get('id')))
        );
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(9);
    }

    cambiaFoco() {
        this.prestacionService.actualizarFoco('sidebar');
    }

    selected(vacuna) {
        this.nuevoValor();
        this.cambiaFoco();
        vacuna.selected = !vacuna.selected;
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = vacuna.id;
            this.router.navigate(['portal-paciente', { outlets: { detalleVacuna: [this.selectedId] } }]);
        }, 500);
    }
}

