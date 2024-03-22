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
            concept: 'Activo'
        }
    };
}
