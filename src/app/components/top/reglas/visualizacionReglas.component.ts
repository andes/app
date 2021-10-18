import { Auth } from '@andes/auth';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ISnomedConcept } from 'src/app/modules/rup/interfaces/snomed-concept.interface';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { IRegla } from '../../../interfaces/IRegla';
import { ITipoPrestacion } from '../../../interfaces/ITipoPrestacion';
import { ReglaService } from '../../../services/top/reglas.service';
import { DocumentosService } from 'src/app/services/documentos.service';

@Component({
    selector: 'visualizacion-reglas',
    templateUrl: './visualizacionReglas.html'
})
export class VisualizacionReglasComponent implements OnInit {
    @Input() esParametrizado = false;
    @Input() prestacion: ISnomedConcept = null;

    @Output() addSolicitud = new EventEmitter<any>();
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

    constructor(
        private servicioReglas: ReglaService,
        private auth: Auth,
        public servicioPrestacion: PrestacionesService,
        private documentosService: DocumentosService
    ) { }

    ngOnInit() {
        if (this.esParametrizado) {
            this.organizacionOrigen = this.auth.organizacion as any;
            this.actualizarTabla();
        }
    }

    get hayFiltro() {
        return this.organizacionOrigen || this.organizacionDestino || this.prestacionOrigen || this.prestacionDestino;
    }

    /**
     * Recarga los datos de la tabla según los filtros ingresados. Debe tener por lo menos un filtro ingresado para que
     * se actualice la tabla
     * @memberof VisualizacionReglasComponent
     */
    actualizarTabla() {
        if (this.filtroIngresado()) {
            const parametros = {
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
        for (const regla of reglas) {
            regla.origen.prestaciones?.forEach((prestacionAux: any) => { // prestacionAux es cada celda del arreglo de origen.prestaciones. Tiene la prestación y si es auditable
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

    public seleccionarConcepto(concepto) {
        this.addSolicitud.emit(concepto);
    }

    descargarReglas() {
        const params = {
            organizacionOrigen: this.organizacionOrigen?.id,
            organizacionDestino: this.organizacionDestino?.id,
            prestacionOrigen: this.prestacionOrigen?.conceptId,
            prestacionDestino: this.prestacionDestino?.conceptId
        };

        this.documentosService.descargarReglasGlobales(params, `reglasGlobales ${moment().format('DD-MM-hh-mm-ss')}`).subscribe();
    }
}


