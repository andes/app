import { CampaniaSaludService } from "../services/campaniaSalud.service";
import { OnInit } from "@angular/core";
import { Component } from '@angular/core';
import { ICampaniaSalud } from "../interfaces/ICampaniaSalud";

@Component({
    selector: 'campaniaSalud',
    templateUrl: 'campaniaSalud.html'
})
export class CampaniaSaludComponent implements OnInit {

    /**
     * Para saber si se debe mostrar la visualizacion o el formulario de edicion/creacion
     * @type {Boolean}
     * @memberof CampaniaSaludComponent
     */
    mostrarVisualizacionCampania: boolean;
    public seleccionada: ICampaniaSalud;
    campanias: ICampaniaSalud[];
    fechaDesde: Date;
    fechaHasta: Date;

    constructor(public campaniaSaludService: CampaniaSaludService) { }

    ngOnInit() {
        this.mostrarVisualizacionCampania = true;

        this.campanias = [];
        // this.seleccionada = xxxxxx;

        this.fechaDesde = moment().startOf('month').toDate();
        this.fechaHasta = moment().endOf('month').toDate();
        this.aplicarFiltrosBusqueda();
    }
    /**
     * dfsdfsdfsdfsdfsdf
     *
     * @memberof CampaniaSaludComponent
     */
    aplicarFiltrosBusqueda() {
        this.campaniaSaludService.getCampanias({
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta
        }).subscribe(res => {
            this.campanias = res;
        });
    }
    seleccionCampania(campania: ICampaniaSalud) {
        this.seleccionada = campania;
    }
    crearCampania() {
        this.seleccionada = {
            asunto: null,
            cuerpo: null,
            link: null,
            imagen: null,
            target: {
                sexo: null,
                grupoEtareo: {
                    desde: null,
                    hasta: null
                }
            },
            vigencia: {
                desde: null,
                hasta: null
            },

            fechaPublicacion: null,
            activo: null,
            textoAccion: null
        };
        this.mostrarVisualizacionCampania = false;
    }
    editarCampania() {
        this.mostrarVisualizacionCampania = false;
    }

    guardarCampania(campania: ICampaniaSalud) {
        this.seleccionada = campania;
        this.mostrarVisualizacionCampania = true;

    }
    cancelarEdicionCampania() {
        this.seleccionada = null;
        this.mostrarVisualizacionCampania = true;
    }
}