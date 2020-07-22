import { Component, Input, OnInit } from '@angular/core';
import { ReglaService } from '../../../services/top/reglas.service';
import { OrganizacionService } from '../../../services/organizacion.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { IRegla } from '../../../interfaces/IRegla';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { ITipoPrestacion } from '../../../interfaces/ITipoPrestacion';
import { Auth } from '@andes/auth';
@Component({
    selector: 'visualizacion-reglas',
    templateUrl: './visualizacionReglas.html'
})
export class VisualizacionReglasComponent implements OnInit {
    @Input()
    esParametrizado = false;
    /**
     * Organización ingresada en el filtro de organización origen
     * @type {IOrganizacion}
     * @memberof VisualizacionReglasComponent
     */
    /**
     * Prestación ingresada en el filtro de prestación origen
     * @type {IOrganizacion}
     * @memberof VisualizacionReglasComponent
     */
    organizacionOrigen: IOrganizacion;
    prestacionOrigen: ITipoPrestacion;
    /**
     * Organización ingresada en el filtro de organización destino
     * @type {IOrganizacion}
     * @memberof VisualizacionReglasComponent
     */
    organizacionDestino: IOrganizacion;
    /**
     * Prestación ingresada en el filtro de prestación destino
     * @type {ITipoPrestacion}
     * @memberof VisualizacionReglasComponent
     */
    prestacionDestino: ITipoPrestacion;
    /**
     * Datos de las filas de la tabla resultados. Se realiza en typescript por ser
     * más sencillo que en HTML
     *
     * @type {any[]}
     * @memberof VisualizacionReglasComponent
     */
    filas: any[];

    constructor(private servicioReglas: ReglaService, private servicioOrganizacion: OrganizacionService, public servicioPrestacion: TipoPrestacionService, private auth: Auth, private serviceTipoPrestacion: TipoPrestacionService) { }

    ngOnInit() {
        if (this.esParametrizado) {
            this.organizacionOrigen = this.auth.organizacion as any;
            this.actualizarTabla();
        }
    }

    /**
     * Trae las prestaciones con nombre "igual" al texto ingresado.
     * Si se ingresa "sulta dica" trae Consulta médica general
     * @param {*} event
     * @memberof VisualizacionReglasComponent
     */
    loadPrestaciones(event) {
        this.servicioPrestacion.get({
            turneable: 1
        }).subscribe(event.callback);
    }

    /**
     * Recarga los datos de la tabla según los filtros ingresados. Debe tener por lo menos un filtro ingresado para que
     * se actualice la tabla
     * @memberof VisualizacionReglasComponent
     */
    actualizarTabla() {
        if (this.filtroIngresado()) {
            let parametros = {
                organizacionOrigen: this.organizacionOrigen ? this.organizacionOrigen.id : '',
                organizacionDestino: this.organizacionDestino ? this.organizacionDestino.id : '',
                prestacionDestino: this.prestacionDestino ? this.prestacionDestino.conceptId : ''
            };
            if (this.esParametrizado) {
                parametros['prestacionesOrigen'] = 'rup:tipoPrestacion:?';
            } else {
                parametros['prestacionOrigen'] = this.prestacionOrigen ? this.prestacionOrigen.conceptId : '';
            }

            this.servicioReglas.get(parametros).subscribe((reglas: [IRegla]) => {
                this.obtenerFilasTabla(reglas);
            });
        } else {
            this.filas = null;
        }
    }

    /**
     * Devuelve si se ha cargado uno de los filtros
     * @returns {boolean}
     * @memberof VisualizacionReglasComponent
     */
    filtroIngresado(): boolean {
        return (this.organizacionOrigen !== null && this.organizacionOrigen !== undefined) ||
            (this.organizacionDestino !== null && this.organizacionDestino !== undefined) ||
            (this.prestacionOrigen !== null && this.prestacionOrigen !== undefined) ||
            (this.prestacionDestino !== null && this.prestacionDestino !== undefined);
    }

    /**
     * Acomoda los datos de las reglas de forma que se pueda acceder facilmente desde la tabla
     *
     * @memberof VisualizacionReglasComponent
     */
    obtenerFilasTabla(reglas: [IRegla]) {
        this.filas = [];
        for (let regla of reglas) {
            regla.origen.prestaciones.forEach((prestacionAux: any) => { // prestacionAux es cada celda del arreglo de origen.prestaciones. Tiene la prestación y si es auditable
                if (!this.prestacionOrigen || this.prestacionOrigen.conceptId === prestacionAux.prestacion.conceptId) {
                    /* Es necesaria esta validación porque una regla tiene un origen y un destino. El origen se compone de
                     * una organización y una lista de prestaciones. Entonces si filtra por prestación origen, que muestre
                     * solo aquellas partes de la regla que cumpla con los filtros ingresados. El destino es una organización
                     * y una sola prestación por lo que no es necesario más validaciones. */
                    this.filas.push({
                        organizacionOrigen: regla.origen.organizacion,
                        prestacionOrigen: prestacionAux,
                        organizacionDestino: regla.destino.organizacion,
                        prestacionDestino: regla.destino.prestacion
                    });
                }
            });
        }
        if (this.esParametrizado) {
            this.filas.sort((fila1, fila2) => {
                if (fila2.prestacionDestino.term < fila1.prestacionDestino.term) {
                    return 1;
                }
                if (fila2.prestacionDestino.term > fila1.prestacionDestino.term) {
                    return -1;
                }
                return 0;
            });
        }
    }
}


