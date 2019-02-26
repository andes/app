import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'tabla-2d',
    templateUrl: './tabla-2d.html'
})
export class Tabla2DComponent implements OnInit, OnChanges {

    @Input() data: any;

    constructor() { }

    public columnas: any[];
    public datos: any[];

    ngOnInit() {

    }

    ngOnChanges() {
        if (this.data) {
            this.datos = [];
            this.columnas = [];
            this.datos = JSON.parse(JSON.stringify(this.data));
            this.columnas = Object.keys(this.datos).map(key => {
                return Object.keys(this.datos[key]);
            });
        }
    }

}
