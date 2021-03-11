import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-mis-mensajes',
    templateUrl: './mis-mensajes.component.html',
})
export class MisMensajesComponent implements OnInit {

    public selectedId;
    public mensaje$;
    public mensajes$;

    sidebarValue = 9;
    @Output() eventoSidebar = new EventEmitter<number>();
    @Output() eventoFoco = new EventEmitter<string>();
    filtros = true;

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
        // Servicios
        this.mensajes$ = this.prestacionService.getMensajes();

        // Mostrar listado (mensajes, historia, labs)
        this.mensaje$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getMensaje(params.get('id')))
        );
    }

    mostrarFiltros() {
        this.filtros = !this.filtros;
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(9);
    }

    cambiaFoco() {
        this.prestacionService.actualizarFoco('sidebar');
    }

    selected(mensaje) {
        this.nuevoValor();
        this.cambiaFoco();
        mensaje.selected = !mensaje.selected;
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = mensaje.id;
            this.router.navigate(['portal-paciente', { outlets: { detalleMensaje: [this.selectedId] } }]);
        }, 500);
    }
}

