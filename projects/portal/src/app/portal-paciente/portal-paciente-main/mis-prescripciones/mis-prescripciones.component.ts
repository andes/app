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

    mainValue = 9;
    @Output() eventoMain = new EventEmitter<number>();
    @Output() eventoSidebar = new EventEmitter<boolean>(); @Output() eventoFoco = new EventEmitter<string>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
        // Servicios
        this.prescripciones$ = this.prestacionService.getPrescripciones();

        // Mostrar listado (prescripciones, historia, labs)
        this.prescripcion$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getPrescripcion(params.get('id')))
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

    selected(prescripcion) {
        this.nuevoValor();
        this.cambiaFoco();
        this.mostrarSidebar();
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = prescripcion.id;
            this.router.navigate(['portal-paciente', { outlets: { detallePrescripcion: [this.selectedId] } }]);
        }, 500);
    }
}

