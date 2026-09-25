import moment from 'moment';
import { Input, Component } from '@angular/core';

@Component({
    selector: 'historial-solicitud',
    templateUrl: './historialSolicitud.html'
})
export class HistorialSolicitudComponent {
    _turno;
    _prestacion;
    itemsHistorial = [];

    @Input()
    set prestacion(value) {
        this._prestacion = value;
        this.cargarItemsHistorial();
    }

    @Input()
    set turno(value) {
        this._turno = value;
        this.cargarItemsHistorial();

    }

    cargarItemsHistorial() {
        let historial = this._prestacion.solicitud.historial;
        if (!historial) {
            historial = [];
        }

        this.itemsHistorial = historial.sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
    }
}
