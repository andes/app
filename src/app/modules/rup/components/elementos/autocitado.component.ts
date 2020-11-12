import { RUPComponent } from './../core/rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RupElement } from '.';


@Component({
    selector: 'rup-autocitado',
    templateUrl: 'autocitado.html'
})
@RupElement('AutocitadoComponent')
export class AutocitadoComponent extends RUPComponent implements OnInit {
    // Tipos de Prestaciones a las que el usuario tiene permiso
    public tiposPrestacion: any = [];
    public prestacionSeleccion;

    public darTurnoEmit = new EventEmitter<any>();

    ngOnInit() {
        // Buscamos los tipos de prestación que sean turneables para los que el tenga permisos
        // (OBS: a futuro un profesional puede tener permisos para más Prestaciones que no sean turneables)
        this.conceptosTurneablesService.search({ permisos: 'rup:tipoPrestacion:?' }).subscribe(data => {
            this.tiposPrestacion = data;
            if (!this.registro.valor) {
                this.registro.valor = { solicitudPrestacion: {} };
                this.registro.valor.solicitudPrestacion['autocitado'] = true;
                this.registro.valor.solicitudPrestacion['prestacionSolicitada'] = this.tiposPrestacion.find(tp => tp.conceptId === this.prestacion.solicitud.tipoPrestacion.conceptId);
                this.cambiarNombre();
            }
        });
    }

    darTurno(prestacionSolicitud) {
        this.darTurnoEmit.emit(prestacionSolicitud);
    }

    cambiarNombre() {
        if (this.registro.valor.solicitudPrestacion.prestacionSolicitada) {
            this.registro.nombre = this.registro.concepto.term + ': ' + this.registro.valor.solicitudPrestacion.prestacionSolicitada.term;
        }
    }
}

