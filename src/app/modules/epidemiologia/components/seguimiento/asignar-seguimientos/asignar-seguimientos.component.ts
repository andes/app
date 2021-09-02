import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'asignar-seguimientos',
    templateUrl: './asignar-seguimientos.html',
})
export class AsignarSeguimientosComponent {
    profesional;
    @Output() close: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    guardar() {
        this.save.emit(this.profesional);
    }

    cerrar() {
        this.close.emit(false);
    }
}
