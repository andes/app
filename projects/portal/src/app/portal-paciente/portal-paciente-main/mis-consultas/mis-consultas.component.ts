import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-mis-consultas',
    templateUrl: './mis-consultas.component.html',
})
export class MisConsultasComponent implements OnInit {

    public selectedId;
    public prestacion$;
    public prestaciones$;

    @Output() eventoMain = new EventEmitter<number>();
    @Output() eventoSidebar = new EventEmitter<boolean>(); @Output() eventoFoco = new EventEmitter<string>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void {

        // Servicios
        this.prestaciones$ = this.prestacionService.getConsultas();

        // Mostrar listado
        this.prestacion$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getConsulta(params.get('id')))
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

    selected(prestacion) {
        prestacion.selected = !prestacion.selected;
        this.nuevoValor();
        this.cambiaFoco();
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = prestacion.id;
            this.router.navigate(['portal-paciente', { outlets: { detalleConsulta: [this.selectedId] } }]);
        }, 500);
    }
}
