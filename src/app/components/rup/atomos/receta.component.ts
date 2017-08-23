import { PrescripcionMedicamentoComponent } from './../moleculas/prescripcionMedicamento.component';
import { Atomo } from './../core/atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
@Component({
    selector: 'rup-Receta',
    templateUrl: 'receta.html'
})
export class RecetaComponent extends Atomo implements OnInit {

    public medicamentos: Array<Object> = [];

    ngOnInit() {
        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : null;
        this.medicamentosEnEjecucion();
        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            // this.devolverValores();
            this.mensaje = this.getMensajes();
        }
    }

    medicamentosEnEjecucion() {
        if (this.valoresPrestacionEjecucion.prescripcionMedicamento) {
            this.medicamentos = [];
            this.medicamentos = [{ id: this.valoresPrestacionEjecucion.prescripcionMedicamento[33633005].medicamento.fsn, nombre: this.valoresPrestacionEjecucion.prescripcionMedicamento[33633005].medicamento.fsn }];
        } else {
            this.medicamentos = [{ id: 'sin medicamentos', nombre: 'Sin medicamentos' }];
        }
    }
}