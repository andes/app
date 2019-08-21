import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'permisos',
    templateUrl: 'permisos.html'
})

export class PermisosComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    @Input() permisos;
    @Input() botonCancelar;

    @Output() cancelarEmit: EventEmitter<boolean> = new EventEmitter<boolean>();

    ngOnInit() {
    }

    cancelar() {
        this.cancelarEmit.emit(true);
    }

}
