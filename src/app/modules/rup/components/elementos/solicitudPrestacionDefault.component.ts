import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-solicitudPrestacionDefault',
    templateUrl: 'solicitudPrestacionDefault.html'
})
@RupElement('SolicitudPrestacionDefaultComponent')
export class SolicitudPrestacionDefaultComponent extends RUPComponent implements OnInit {

    private listaPlanes: any = [];
    public organizaciones: any[] = [];
    // public puedeAutocitar: Boolean = false;

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                solicitudPrestacion: {}
            };
            this.registro.valor.solicitudPrestacion['autocitado'] = false;
            this.registro.valor.solicitudPrestacion['prestacionSolicitada'] = this.registro.concepto;
            this.servicioReglas.get({
                organizacionOrigen: this.auth.organizacion.id,
                prestacionOrigen: this.prestacion.solicitud.tipoPrestacion.conceptId,
                prestacionDestino: this.registro.concepto.conceptId
            }).subscribe(reglas => {
                this.organizaciones = reglas.map(elem => { return { id: elem.destino.organizacion.id, nombre: elem.destino.organizacion.nombre }; });
            });
        }
    }

    isEmpty() {
        const value = this.registro.valor.solicitudPrestacion;
        return !value.motivo && !value.indicaciones && !value.organizacionDestino && !value.profesionalesDestino;
    }

    loadProfesionales(event) {
        if (event && event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            let callback = (this.registro.valor.solicitudPrestacion.profesionalesDestino) ? this.registro.valor.solicitudPrestacion.profesionalesDestino : null;
            event.callback(callback);
        }
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(resultado => {
                event.callback(resultado);
            });
        } else {
            let callback = (this.registro.valor.solicitudPrestacion.organizacionDestino) ? this.registro.valor.solicitudPrestacion.organizacionDestino : null;
            event.callback(callback);
        }
    }

    verificarAutocitacion() {
        if (this.registro.valor.solicitudPrestacion.profesionales) {
            if (this.registro.valor.solicitudPrestacion.profesionales.find(p => p.id === this.auth.profesional)) {
                this.registro.valor.solicitudPrestacion['autocitado'] = true;
            }
        }
    }
}
