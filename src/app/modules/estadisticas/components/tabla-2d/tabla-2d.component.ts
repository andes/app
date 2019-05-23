import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'tabla-2d',
    templateUrl: './tabla-2d.html'
})
export class Tabla2DComponent implements OnInit, OnChanges {

    @Input() data: any;
    @Input() titulo: any;

    constructor() { }

    public columnas: any[];
    public datos: any[];
    public tipoTurno = {
        delDia: 'Del día',
        programado: 'Programado',
        gestion: 'Con llave',
        profesional: 'Profesional',
        sobreturno: 'Sobreturno'
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

}
