import { Component, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'botones-registro',
    templateUrl: 'botones-registro.html',
    styleUrls: ['botones-registro.scss']
})

export class BotonesRegistroComponent {
    @Output() bebeSelected = new EventEmitter();
    @Output() sinDniSelected = new EventEmitter();
    @Output() identificado = new EventEmitter();

    onBebeSelected() {
        return this.bebeSelected.emit(null);
    }

    onSinDniSelected() {
        return this.sinDniSelected.emit(null);
    }

    onIdentificadoSelected() {
        return this.identificado.emit(null);
    }
}
