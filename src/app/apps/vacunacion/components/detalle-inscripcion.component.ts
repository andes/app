import { Component, Input } from '@angular/core';

@Component({
    selector: 'detalle-inscripcion',
    templateUrl: 'detalle-inscripcion.html'
})

export class DetalleInscripcionComponent {
    public inscripcion: any;

    @Input('inscripcion')
    set _inscripcion(value) {
        this.inscripcion = value;
    }

}
