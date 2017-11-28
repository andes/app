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
        if (!this.registro.valor) {
            this.registro.valor = {
                cantidad: 0,
                unidad: { id: 'envases', nombre: 'Envases' },
                recetable: false,
                indicacion: '',
                estado: 'Activo',
                duracion: {
                    cantidad: '',
                    unidad: { id: 'dias', nombre: 'Día(s)' },
                },
            };
        }
        // Observa cuando cambia la propiedad 'dosis' en otro elemento RUP
        this.conceptObserverService.observe(this.registro).subscribe((data) => {

            if (this.registro.valor !== data.valor) {
                this.registro.valor = data.valor;
                this.emitChange(false);
            }
        });
        if (this.registro.valor) {
            this.mensaje = this.getMensajes();
        }
    }

}
