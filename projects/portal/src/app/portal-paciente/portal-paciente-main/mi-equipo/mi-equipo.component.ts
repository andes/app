import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-mi-equipo',
    templateUrl: './mi-equipo.component.html',
})
export class MiEquipoComponent implements OnInit {

    public selectedId;
    public profesional$;
    public equipo$;

    @Output() eventoMain = new EventEmitter<number>();
    @Output() eventoSidebar = new EventEmitter<boolean>();
    @Output() eventoFoco = new EventEmitter<string>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
        // Servicios
        this.equipo$ = this.prestacionService.getEquipo();

        // Mostrar listado (profesionales, historia, labs)
        this.profesional$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getProfesional(params.get('id')))
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

    selected(profesional) {
        this.nuevoValor();
        this.cambiaFoco();
        this.mostrarSidebar();
        this.selectedId = profesional.id;
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            profesional.selected = !profesional.selected;
            this.router.navigate(['portal-paciente', { outlets: { detalleProfesional: [this.selectedId] } }]);
        }, 500);
    }
}

