import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import * as moment from 'moment';
@Component({
    selector: 'rup-registrarMedicamentoDefault',
    templateUrl: 'registrarMedicamentoDefault.html'
})

export class RegistrarMedicamentoDefaultComponent extends RUPComponent implements OnInit {

    public unidades = [{ id: 'envases', nombre: 'Envases' }, { id: 'unidades', nombre: 'Unidades' }];
    public estados = [{ id: 'activo', nombre: 'Activo' }, { id: 'suspendido', nombre: 'Suspendido' }, { id: 'finalizado', nombre: 'Finalizado' }];
    public unidadTiempo = [{ id: 'anios', nombre: 'Año(s)' }, { id: 'mes', nombre: 'Mes(es)' }, { id: 'semanas', nombre: 'Semana(s)' }, { id: 'dias', nombre: 'Día(s)' }];
    public inicioEstimadoTiempo = { id: 'dias', nombre: 'Día(s)' };
    inicioEstimadoUnidad: any = null;

    ngOnInit() {
        debugger;
        if (!this.registro.valor) {
            this.registro.valor = {
                cantidad: 0,
                unidad: 'unidades',
                recetable: false,
                indicacion: '',
                estado: 'activo',
                duracion: {
                    cantidad: '',
                    unidad: 'dias'
                },
            };
        } else {
            // Si llega un idRegistroOrigen es porque se vuelve a indicar un medicamento que ya existe en la HUDS
            // tenemos que mostrar las evoluciones anteriores
            if (this.registro.valor.idRegistroOrigen) {

            }
        }
    }

    formatearDuracion() {
        this.registro.valor.duracion.unidad = ((typeof this.registro.valor.duracion.unidad === 'string')) ? this.registro.valor.duracion.unidad : (Object(this.registro.valor.unidad).id);
        this.emitChange();
    }

    formatearUnidad() {
        this.registro.valor.unidad = ((typeof this.registro.valor.unidad === 'string')) ? this.registro.valor.unidad : (Object(this.registro.valor.unidad).id);
        this.emitChange();
    }

}
