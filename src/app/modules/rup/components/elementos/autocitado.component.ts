import { element } from 'protractor';
import { RUPComponent } from './../core/rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
@Component({
    selector: 'rup-autocitado',
    templateUrl: 'autocitado.html'
})
export class AutocitadoComponent extends RUPComponent implements OnInit {
    // Tipos de prestacion que el usuario tiene permiso
    public tiposPrestacion: any = [];
    public prestacionSeleccion;

    public darTurnoEmit = new EventEmitter<any>();

    ngOnInit() {
        this.registro.valor = (this.registro.valor) ? this.registro.valor : {};
        this.servicioTipoPrestacion.get({ id: this.auth.getPermissions('rup:tipoPrestacion:?') }).subscribe(data => {
            this.tiposPrestacion = data;
        });
    }

    darTurno(prestacionSolicitud) {
        this.darTurnoEmit.emit(prestacionSolicitud);
    }
}
