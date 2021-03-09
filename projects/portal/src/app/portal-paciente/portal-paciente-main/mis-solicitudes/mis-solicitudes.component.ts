import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-mis-solicitudes',
    templateUrl: './mis-solicitudes.component.html',
})
export class MisSolicitudesComponent implements OnInit {

    public selectedId;
    public solicitud$;
    public solicitudes$;


    @Output() eventoSidebar = new EventEmitter<number>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void {

        // Servicios
        this.solicitudes$ = this.prestacionService.getSolicitudes();

        //mostrar listado
        this.solicitud$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getSolicitud(params.get('id')))
        );
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(9);
    }

    selected(solicitud) {
        this.nuevoValor();
        this.prestacionService.resetOutlet();
        setTimeout(() => {
            this.selectedId = solicitud.id;
            this.router.navigate(['portal-paciente', { outlets: { detalleSolicitud: [this.selectedId] } }]);
        }, 500);
    }
}
