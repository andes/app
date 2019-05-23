import { Component, OnInit, Input } from '@angular/core';


@Component({
    templateUrl: 'graficos.html',
    selector: 'graph-table'
})

export class GraficosComponent implements OnInit {
    private _data: any;
    @Input() titulo = '';
    @Input() type = 'bar';

    @Input('data')
    set data(value: any) {
        this.limpiarData();
        // Es necesario cargar los datos dentro de un setTimout porque si no se saca del DOM
        // el canvas no se actualiza y muestra datos cruzados
        setTimeout(() => {
            this._data = value;
            this.cargarResultados(this._data);
        }, 100);
    }
    get data(): any {
        return this._data;
    }

    @Input() table;
    @Input() tipoDeFiltro;

    public dataTable = [];
    public dataGraph = [];
    public labelsGraph = [];
    public dataTableTotal = 0;

    public barOptions = {
        legend: { display: false },
        scales: {
            xAxes: [{
                ticks: {
                    autoSkip: false
                }
            }],
            yAxes: [{
                ticks: {
                    min: 0,
                }
            }],

        },
    };

    public barColors: Array<any> = [{ backgroundColor: '#5bc0de' }];

    public chartColors: Array<any> = [{
        backgroundColor: [
            '#92278e',
            '#00A8E0',
            '#ff4a1a',
            '#660520',
            '#e3007e',
            '#00bcb4',
            '#0070cc',
            '#b9c512',
            '#111',
            '#b9c512',
            '#002738',
            '#f4a03b',
            '#a0a0a0',
            '#8bc43f'
        ]
    }];

    ngOnInit() {
    }

    limpiarData() {
        this._data = null;
        this.dataTable = [];
        this.dataGraph = [];
        this.labelsGraph = [];
        this.dataTableTotal = 0;
    }

    cargarResultados(data) {
        if (data) {
            this.dataGraph = this.type === 'bar' ? [
                {data: data.map(item => item.count), label: this.tipoDeFiltro}
            ] : data.map(item => item.count);
            this.labelsGraph = data.map(item => item.nombre ? item.nombre : item._id);
            this.dataTable = data;

            let sum = 0;
            data.forEach((item) => sum += item.count);
            this.dataTableTotal = sum;
        }
    }
}
