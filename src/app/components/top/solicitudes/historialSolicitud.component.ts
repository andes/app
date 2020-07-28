import { Input, Component, OnInit } from '@angular/core';

@Component({
    selector: 'historial-solicitud',
    templateUrl: './historialSolicitud.html'
})
export class HistorialSolicitudComponent {
    turno;
    prestacion;
    itemsHistorial = [];

    @Input('prestacion')
    set _prestacion(value) {
        this.prestacion = value;
        this.cargarItemsHistorial();
    }

    @Input('turno')
    set _turno(value) {
        this.turno = value;
        this.cargarItemsHistorial();

    }

    cargarItemsHistorial() {
        let historial = this.prestacion.solicitud.historial;
        if (!historial) {
            historial = [];
        }

        this.itemsHistorial = historial.sort( (a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
    }
}
