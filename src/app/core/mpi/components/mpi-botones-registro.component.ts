import { Component, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'mpi-botones-registro',
    templateUrl: 'mpi-botones-registro.html',
    styleUrls: ['mpi-botones-registro.scss']
})

export class BotonesRegistroComponent {
    @Output() seleccion = new EventEmitter<String>();

    onBebeSelected() {
        return this.seleccion.emit('bebe');
    }

    onSinDniSelected() {
        return this.seleccion.emit('sinDni');
    }

    onIdentificadoSelected() {
        return this.seleccion.emit('identificado');
    }
}
