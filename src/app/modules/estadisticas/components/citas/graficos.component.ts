import { Component, OnInit, HostBinding, EventEmitter, Output, Input, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    templateUrl: 'graficos.html',
    selector: 'graph-table'
})

export class GraficosComponent implements OnInit {
    private _data: any;
    @Input('data')
    set data(value: any) {
        this.limpiarData();
        this._data = value;
        // Es necesario cargar los datos dentro de un setTimout porque si no se saca del DOM
        // el canvas no se actualiza y muestra datos cruzados
        setTimeout(() => {
            this.cargarResultados(this._data);
        }, 1000);
    }
    get data(): any {
        return this._data;
    }

    private _view: any;
    @Input('view')
    set view(value: any) {
        this._view = value;
    }
    get view(): any {
        return this._view;
    }

    public dataTable = [];
    public dataGraph = [];
    public labelsGraph = [];
    public dataTableTotal = 0;
    public tipoDeFiltro;
    public titulo;
    public tipoGrafico;

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
            '#f1930d',
            '#ff4a1a',
            '#f4a03b',
            '#92278e',
            '#0070cc',
            '#00bcb4',
            '#b9c512',
            '#111',
            '#b9c512',
            '#002738',
            '#660520',
            '#a0a0a0',
            '#8bc43f'
        ]
    }];

    ngOnInit() {
    }

    limpiarData() {
        this.dataTable = [];
        this.dataGraph = [];
        this.labelsGraph = [];
        this.dataTableTotal = 0;
    }

    cargarResultados(value) {
        if (value && value.data) {
            this.tipoGrafico = value.tipoGrafico;
            this.tipoDeFiltro = value.tipoDeFiltro;
            this.dataGraph = this.tipoGrafico === 'bar' ? [{data: value.data.map(item => item.count), label: this.tipoDeFiltro}] : value.data.map(item => item.count);
            this.labelsGraph = value.data.map(item => item.nombre ? item.nombre : item._id);
            this.dataTable = value.data;
            this.titulo = value.titulo;

            let sum = 0;
            value.data.map(function(item) {
                sum += item.count;
            });
            this.dataTableTotal = sum;
        }
    }
}
