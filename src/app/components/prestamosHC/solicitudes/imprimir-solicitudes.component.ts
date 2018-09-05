import { Component, Input, EventEmitter, Output, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import * as moment from 'moment';

@Component({
    selector: 'imprimir-solicitudes',
    templateUrl: 'imprimir-solicitudes.component.html',
    styleUrls: ['imprimir-solicitudes.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ImprimirSolicitudesComponent implements OnInit {

    public solicitudes;
    public idOrganizacion = this.auth.organizacion.id;

    @Input('solicutudes')
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

    ngOnInit() {
        // this.autorizado = this.auth.getPermissions('turnos:agenda:puedeImprimir:').length > 0;
    }

    imprimir() {
        window.print();
    }

    cancelar() {
        this.volverAlListadoEmit.emit(true);
    }

}
