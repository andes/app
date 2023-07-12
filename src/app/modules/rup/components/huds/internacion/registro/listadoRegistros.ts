import { Component, Input } from '@angular/core';

@Component({
    selector: 'listado-registros',
    templateUrl: 'listadoRegistros.html',
    styleUrls: ['./../detalleRegistroInternacion.scss']
})

export class ListadoRegistrosComponent {
    @Input() registro;
    @Input() indicaciones;


    public indicacionBadge = {
        draft: {
            type: 'default',
            concept: 'Borrador'
        },
        active: {
            type: 'success',
            concept: 'Validada'
        },
        pending: {
            type: 'info',
            concept: 'Pendiente'
        },
        bypass: {
            type: 'info',
            concept: 'Bypass'
        },
        cancelled: {
            type: 'danger',
            concept: 'Suspendida'
        }
    };
}
