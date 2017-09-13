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


    ngOnInit() {
        this.registro.valor = (this.registro.valor) ? this.registro.valor : {};
        this.servicioTipoPrestacion.get({ id: this.auth.getPermissions('rup:tipoPrestacion:?') }).subscribe(data => {
            this.tiposPrestacion = data;
            if (this.registro.valor) {
                let valorActual = this.prestacion.ejecucion.registros.filter(r => r.valor.prestacionSeleccion);
                this.tiposPrestacion.forEach(element => {
                    if (element.conceptId === valorActual[0].valor.prestacionSeleccion.conceptId) {
                        this.registro.valor.prestacionSeleccion = element;
                    }
                });

            }
        });
    }
}
