import { Component, Input, EventEmitter, Output, HostBinding, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

@Component({
    selector: 'imprimir-solicitudes',
    templateUrl: 'imprimir-solicitudes.component.html',
    styleUrls: ['imprimir-solicitudes.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ImprimirSolicitudesComponent {

    public solicitudes;
    public idOrganizacion = this.auth.organizacion.id;

    @Input()
    set solicutudes(value: any) {
        this.solicitudes = value;
    }
    get solicutudes(): any {
        return this.solicitudes;
    }

    @Output() volverAlListadoEmit = new EventEmitter<boolean>();
    @HostBinding('class.plex-layout') layout = true;

    autorizado = false;
    showCarpetas = true;
    turnosAsignados = [];
    titulo = '';

    constructor(public plex: Plex, public auth: Auth) { }

    imprimir() {
        window.print();
    }

    cancelar() {
        this.volverAlListadoEmit.emit();
    }

}
