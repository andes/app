import { Input, Component, OnInit } from '@angular/core';

@Component({
    selector: 'historial-derivacion',
    templateUrl: './historial-derivacion.html'
})
export class HistorialDerivacionComponent {
    public derivacion;
    public itemsHistorial = [];
    @Input('derivacion')
    set _derivacion(value) {
        this.derivacion = value;
        this.cargarItemsHistorial();
    }

    cargarItemsHistorial() {
        let historial = this.derivacion.historial;
        if (!historial) {
            historial = [];
        }
        this.itemsHistorial = historial.sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
    }
}
