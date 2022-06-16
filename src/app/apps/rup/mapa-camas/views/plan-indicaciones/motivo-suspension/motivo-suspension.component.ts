import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'suspension-indicacion',
    templateUrl: 'motivo-suspension.component.html'
})

export class SuspensionIndicacionComponent {

    motivo;
    @Output() cancelar = new EventEmitter<boolean>();
    @Output() guardar = new EventEmitter<any>();

    guardarSuspension() {
        this.guardar.emit(this.motivo);
    }

    cancelarSuspension() {
        this.cancelar.emit(false);
    }
}
