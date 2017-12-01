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
    public medicamentoEvoluciones: any; //
    public unaEvolucion;
    public indice = 0;
    public evoluciones;

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                cantidad: 0,
                unidad: 'unidades',
                recetable: true,
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
                this.prestacionesService.getUnMedicamentoXOrigen(this.paciente.id, this.registro.valor.idRegistroOrigen)
                    .subscribe(medicamento => {
                        if (medicamento) {
                            this.medicamentoEvoluciones = medicamento;
                            this.evoluciones = JSON.parse(JSON.stringify(this.medicamentoEvoluciones.evoluciones));

                            if (this.registro.valor.duracion) {
                                this.evoluciones.shift();
                            }
                            if (this.evoluciones && this.evoluciones.length > 0) {
                                this.unaEvolucion = this.evoluciones[0];
                                this.registro.valor.duracion = this.registro.valor.duracion ? this.registro.valor.duracion : this.unaEvolucion.duracion;
                                this.registro.valor.estado = this.registro.valor.estado ? this.registro.valor.estado : this.unaEvolucion.estado;
                                this.registro.valor.indicacion = this.registro.valor.indicacion ? this.registro.valor.indicacion : this.unaEvolucion.indicacion;
                                this.registro.valor.recetable = this.registro.valor.recetable ? this.registro.valor.recetable : this.unaEvolucion.recetable;
                                this.registro.valor.unidad = this.registro.valor.unidad ? this.registro.valor.unidad : this.unaEvolucion.unidad;
                                this.registro.valor.cantidad = this.registro.valor.cantidad ? this.registro.valor.cantidad : this.unaEvolucion.cantidad;
                            }
                        } else {
                            this.registro.valor = {
                                cantidad: 0,
                                unidad: 'unidades',
                                recetable: true,
                                indicacion: '',
                                estado: 'activo',
                                duracion: {
                                    cantidad: '',
                                    unidad: 'dias'
                                },
                            };
                        }
                    });
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

    formateaEstado() {
        this.registro.valor.estado = ((typeof this.registro.valor.estado === 'string')) ? this.registro.valor.estado : (Object(this.registro.valor.estado).id);
        this.emitChange();
    }

    cambiarEvolucion(signo) {
        if (signo === '+') {
            if (this.indice < (this.evoluciones.length - 1)) {
                this.indice = this.indice + 1;
                this.unaEvolucion = this.evoluciones[this.indice];
            }
        } else {
            if (this.indice > 0) {
                this.indice = this.indice - 1;
                this.unaEvolucion = this.evoluciones[this.indice];
            }
        }
    }

}
