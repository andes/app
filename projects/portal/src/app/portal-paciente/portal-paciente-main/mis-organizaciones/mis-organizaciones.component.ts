import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-mis-organizaciones',
    templateUrl: './mis-organizaciones.component.html',
})
export class MisOrganizacionesComponent implements OnInit {

    public selectedId;
    public organizacion$;
    public organizaciones$;

    sidebarValue = 9;
    @Output() eventoSidebar = new EventEmitter<number>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,) { }

    ngOnInit(): void {
        // Servicios
        this.organizaciones$ = this.prestacionService.getOrganizaciones();

        //mostrar listado (organizaciones, historia, labs)
        this.organizacion$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getOrganizacion(params.get('id')))
        );
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(9);
    }

    selected(organizacion) {
        this.nuevoValor();
        organizacion.selected = !organizacion.selected;
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = organizacion.id;
            this.router.navigate(['portal-paciente', { outlets: { detalleOrganizacion: [this.selectedId] } }]);
        }, 500);
    }
}

