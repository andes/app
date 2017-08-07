import { Atomo } from './../core/atomoComponent';
// import { RupComponent } from './../rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'rup-nueva-evolucion-problema',
    templateUrl: 'nuevaEvolucionProblema.html'
})

export class NuevaEvolucionProblemaComponent extends Atomo implements OnInit {
    public fechaInicio: Date;
    public HallazgoCompleto;
    public unaEvolucion;
    public indice = 0;
    public evoluciones;

    // estadoActual: any = { id: 'activo', nombre: 'Activo' };
    inicioEstimadoUnidad: any = null;
    inicioEstimadoTiempo: any = { id: 'dias', nombre: 'Día(s)' };
    estados = [{ id: 'resuelto', nombre: 'Resuelto' }, { id: 'inactivo', nombre: 'Inactivo' }, { id: 'activo', nombre: 'Activo' }];
    unidadTiempo = [{ id: 'anios', nombre: 'Año(s)' }, { id: 'mes', nombre: 'Mes(es)' }, { id: 'semanas', nombre: 'Semana(s)' }, { id: 'dias', nombre: 'Día(s)' }];


    /* los atomos por defecto se inicializan en null porque generalmente tienen un solo input
     * al ser este un caso de atomo medio particular que lleva muchas propiedades dentro
     * entonces inicializamos data como un objeto
     */
    ngOnInit() {
        this.data[this.elementoRUP.key] = {};
        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            if (this.datosIngreso.datoCompleto) {
                this.HallazgoCompleto = this.datosIngreso.datoCompleto;
                this.evoluciones = JSON.parse(JSON.stringify(this.HallazgoCompleto.evoluciones));
                this.evoluciones.shift();
                this.data[this.elementoRUP.key].estado = this.datosIngreso.ultimaEvolucion ? this.datosIngreso.ultimaEvolucion.estado : 'activo';
                this.data[this.elementoRUP.key].esCronico = this.datosIngreso.ultimaEvolucion ? this.datosIngreso.ultimaEvolucion.esCronico : false;
                // this.data[this.elementoRUP.key].esEnmienda = this.HallazgoCompleto.evoluciones[this.HallazgoCompleto.evoluciones.lenght - 1].esEnmienda;
                this.data[this.elementoRUP.key].evolucion = this.datosIngreso.ultimaEvolucion ? this.datosIngreso.ultimaEvolucion.evolucion : '';

                if (this.evoluciones) {
                    this.unaEvolucion = this.evoluciones[0];
                }
            } else {
                this.HallazgoCompleto = this.datosIngreso;

                if (this.HallazgoCompleto.evoluciones) {
                    this.evoluciones = JSON.parse(JSON.stringify(this.HallazgoCompleto.evoluciones));
                    this.unaEvolucion = this.HallazgoCompleto.evoluciones[0];
                    this.data[this.elementoRUP.key].estado = this.HallazgoCompleto.evoluciones[this.HallazgoCompleto.evoluciones.length - 1].estado;
                    this.data[this.elementoRUP.key].esCronico = this.HallazgoCompleto.evoluciones[this.HallazgoCompleto.evoluciones.length - 1].esCronico;
                    // this.data[this.elementoRUP.key].esEnmienda = this.HallazgoCompleto.evoluciones[this.HallazgoCompleto.evoluciones.lenght - 1].esEnmienda;
                    this.data[this.elementoRUP.key].evolucion = '';

                }
            }
            this.devolverValores();
        }

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
