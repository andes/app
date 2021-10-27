import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { EstAgendasService } from '../../services/agenda.service';

@Component({
    selector: 'tabla-2d',
    templateUrl: './tabla-2d.html'
})
export class Tabla2DComponent implements OnInit, OnChanges {

    @Input() data: any;
    @Input() titulo: any;
    @Input() filtros: any;

    public columns = [
        {
            key: '#',
            label: '#',
            sorteable: false,
            opcional: false
        },
        {
            key: 'deldia',
            label: 'Del día',
            sorteable: false,
            opcional: false
        },
        {
            key: 'programado',
            label: 'Programado',
            sorteable: false,
            opcional: false
        },
        {
            key: 'conllave',
            label: 'Con llave',
            sorteable: false,
            opcional: false
        },
        {
            key: 'profesional',
            label: 'Profesional',
            sorteable: false,
            opcional: false
        },
        {
            key: 'sobreturno',
            label: 'Sobreturno',
            sorteable: false,
            opcional: false
        },
        {
            key: 'appmobile',
            label: 'App Mobile',
            sorteable: false,
            opcional: false
        },
    ];

    constructor(public estService: EstAgendasService) { }
    public requestInProgress: boolean;
    public columnas: any[];
    public datos: any[];
    public tipoTurno = {
        delDia: 'Del día',
        programado: 'Programado',
        gestion: 'Con llave',
        profesional: 'Profesional',
        sobreturno: 'Sobreturno',
        appMobile: 'App Mobile'
    };

    ngOnInit() {

    }

    ngOnChanges() {
        if (this.data) {
            this.datos = this.data;
            this.columnas = [];
            this.columnas = Object.keys(this.datos).map(key => {
                return Object.keys(this.datos[key]);
            });
        }
    }

    descargar(value) {
        // ARMAR CSV para visualizar todos los datos
        const tabla = Object.keys(value).map(city => {
            const dataReturn = { Localidad: city };
            Object.keys(value[city]).map(c => {
                dataReturn[this.tipoTurno[c]] = value[city][c];
            });
            return dataReturn;
        });
        // Se agregan datos de filtrados en el primer elemendo del array para visualizar en csv en la primer row
        Object.keys(this.filtros).map(filtro => tabla[0][filtro] = this.filtros[filtro] ? this.filtros[filtro] : '');
        this.requestInProgress = true;
        this.estService.descargarCSV(value, 'Dashboard Turnos' + '-' + this.titulo).subscribe(
            () => this.requestInProgress = false,
            () => this.requestInProgress = false
        );
    }

}
