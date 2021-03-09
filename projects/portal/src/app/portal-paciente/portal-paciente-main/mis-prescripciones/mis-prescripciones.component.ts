import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-mis-prescripciones',
    templateUrl: './mis-prescripciones.component.html',
})
export class MisPrescripcionesComponent implements OnInit {

    public selectedId;
    public prescripcion$;
    public prescripciones$;

    sidebarValue = 9;
    @Output() eventoSidebar = new EventEmitter<number>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,) { }

    ngOnInit(): void {
        // Servicios
        this.prescripciones$ = this.prestacionService.getPrescripciones();

        //mostrar listado (prescripciones, historia, labs)
        this.prescripcion$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getPrescripcion(params.get('id')))
        );
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(9);
    }

    selected(prescripcion) {
        this.nuevoValor();
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = prescripcion.id;
            this.router.navigate(['portal-paciente', { outlets: { detallePrescripcion: [this.selectedId] } }]);
        }, 500);
    }
}

