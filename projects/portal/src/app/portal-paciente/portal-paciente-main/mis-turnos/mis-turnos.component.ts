import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-mis-turnos',
    templateUrl: './mis-turnos.component.html',
})
export class MisTurnosComponent implements OnInit {

    public selectedId;
    public turno$;
    public turnos$;

    mainValue = 9;
    @Output() eventoMain = new EventEmitter<number>();
    @Output() eventoSidebar = new EventEmitter<boolean>(); @Output() eventoFoco = new EventEmitter<string>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
        // Servicios
        this.turnos$ = this.prestacionService.getTurnos();

        // Mostrar listado (turnos, historia, labs)
        this.turno$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getTurno(params.get('id')))
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

    selected(turno) {
        this.nuevoValor();
        this.cambiaFoco();
        this.mostrarSidebar();
        turno.selected = !turno.selected;
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = turno.id;
            this.router.navigate(['portal-paciente', { outlets: { detalleTurno: [this.selectedId] } }]);
        }, 500);
    }
}

