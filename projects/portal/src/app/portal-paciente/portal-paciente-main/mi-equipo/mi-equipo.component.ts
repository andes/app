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

    sidebarValue = 12;
    @Output() eventoSidebar = new EventEmitter<number>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,) { }

    ngOnInit(): void {
        // Servicios
        this.equipo$ = this.prestacionService.getEquipo();

        //mostrar listado (profesionales, historia, labs)
        this.profesional$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getProfesional(params.get('id')))
        );
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(9);
    }


    selected(profesional) {
        this.selectedId = profesional.id;
        this.router.navigate(['portal-paciente', { outlets: { detalleProfesional: [this.selectedId] } }]);
    }
}

