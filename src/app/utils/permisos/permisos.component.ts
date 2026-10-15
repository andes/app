import { Plex } from '@andes/plex';
import { Component, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { Auth } from '@andes/auth';
// Services

@Component({
    selector: 'permisos',
    templateUrl: 'permisos.html',
    // styleUrls: ['permisos.scss']
})

export class PermisosComponent {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    @Input() permisos;
    @Input() botonCancelar;

    // Eventos
    @Output() cancelarEmit: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private plex: Plex, private auth: Auth) {

    }

    cancelar() {
        this.cancelarEmit.emit(true);
    }

}
