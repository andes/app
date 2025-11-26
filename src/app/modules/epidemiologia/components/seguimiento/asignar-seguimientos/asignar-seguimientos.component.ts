import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'asignar-seguimientos',
    templateUrl: './asignar-seguimientos.html',
})
export class AsignarSeguimientosComponent {
    profesional;
    @Output() closed: EventEmitter<any> = new EventEmitter<any>();
    @Output() saved: EventEmitter<any> = new EventEmitter<any>();

    guardar() {
        this.saved.emit(this.profesional);
    }

    cerrar() {
        this.closed.emit(false);
    }
}
