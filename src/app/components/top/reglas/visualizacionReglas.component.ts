import { Component } from '@angular/core';
import { ReglaService } from '../../../services/top/reglas.service';
import { OrganizacionService } from '../../../services/organizacion.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';

@Component({
    selector: 'visualizacion-reglas',
    templateUrl: './visualizacionReglas.html'
})
export class VisualizacionReglasComponent {
    dataOrganizacionesOrigen: any[];
    organizacionOrigen;
    prestacionOrigen;
    organizacionDestino;
    prestacionDestino;
    seleccionado;
    /**
     * Datos de los renglones de la tabla resultados. Se realiza en typescript por ser 
     * más sencillo que en HTML
     *
     * @type {{}[]}
     * @memberof VisualizacionReglasComponent
     */
    renglones: {}[];
    reglas: any[];
    constructor(private servicioReglas: ReglaService, private servicioOrganizacion: OrganizacionService, public servicioPrestacion: TipoPrestacionService) { }

    loadOrganizaciones(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get({
            turneable: 1
        }).subscribe(event.callback);

    }

    actualizarTabla() {
        if (this.filtroIngresado) {
            let parametros = {
                organizacionOrigen: this.organizacionOrigen ? this.organizacionOrigen.id : '',
                prestacionOrigen: this.prestacionOrigen ? this.prestacionOrigen : '',
                organizacionDestino: this.organizacionDestino ? this.organizacionDestino.id : '',
                prestacionDestino: this.prestacionDestino ? this.prestacionDestino : ''
            }
            console.log('organizacionOrigen', this.organizacionOrigen);

            this.servicioReglas.get(parametros).subscribe(res => {
                this.reglas = res;
                console.log('reglas', this.reglas);
            });
        }
    }

    /**
     * Devuelve si se ha cargado uno de los filtros
     * @returns {boolean}
     * @memberof VisualizacionReglasComponent
     */
    filtroIngresado(): boolean {
        return this.organizacionOrigen !== '' || this.organizacionDestino !== '' || this.prestacionOrigen !== '' || this.prestacionDestino !== '';
    }
}

