import { cache } from '@andes/shared';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReglaService } from 'src/app/services/top/reglas.service';

@Component({
    selector: 'servicio-intermedio-listado',
    templateUrl: './servicio-intermedio-listado.component.html'
})
export class ServicioIntermedioListadoComponent {
    public columns = [
        {
            key: 'organizacion-origen',
            label: 'Organizacion Origen',
            sorteable: false,
            opcional: false
        },
        {
            key: 'prestacion-origen',
            label: 'Prestacion Origen',
            sorteable: false,
            opcional: false
        },
        {
            key: 'organizacion-destino',
            label: 'Organizacion Destino',
            sorteable: false,
            opcional: false
        },
        {
            key: 'prestacion-destino',
            label: 'Prestacion Destino',
            sorteable: false,
            opcional: false
        },
        {
            key: 'servicio-intermedio',
            label: 'Servicio Intermedio',
            sorteable: false,
            opcional: false
        },
        {
            key: 'acciones',
            label: ' ',
            sorteable: false,
            opcional: false
        }
    ];

    reglas$ = this.reglasServices.get({
        esServicioIntermedio: true
    }).pipe(
        cache()
    );

    constructor(
        private reglasServices: ReglaService,
        private router: Router,
    ) {

    }

    onNuevo() {
        this.router.navigate(['servicio-intermedio', 'nuevo']);
    }

    OnEdit(regla) {
        this.router.navigate(['servicio-intermedio', regla.id]);
    }
}
