import { Component, OnInit, Input } from '@angular/core';
import { EstAgendasService } from '../../services/agenda.service';


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
    @Input() filtros;
    @Input() dashboard;

    public dataTable = [];
    public dataGraph = [];
    public labelsGraph = [];
    public dataTableTotal = 0;
    public requestInProgress: boolean;
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
            '#f4a03b',
            '#002738',
            '#b9c512',
            '#00bcb4',
            '#111',
            '#b9c512',
            '#002738',
            '#a0a0a0',
            '#8bc43f'
        ]
    }];

    constructor(public estService: EstAgendasService) { }


    ngOnInit() {
    }

    descargar(value) {
        if (this.filtros && this.filtros.tipoDeFiltro === 'turnos') {
            // Se agregan datos de filtrados en el primer elemendo del array para visualizar en csv
            Object.keys(this.filtros).map(filtro => value[0][filtro] = this.filtros[filtro] ? this.filtros[filtro] : '');
            this.requestInProgress = true;
            this.estService.descargarCSV(value, this.dashboard + '-' + this.titulo).subscribe(
                () => this.requestInProgress = false,
                () => this.requestInProgress = false
            );
        }
    }

    limpiarData() {
        this._data = null;
        this.dataTable = [];
        this.dataGraph = [];
        this.labelsGraph = [];
        this.dataTableTotal = 0;
    }

    cargarResultados(data) {
        if (data && data.length > 0 && data[0].count > 0 && this.filtros) {
            this.dataGraph = this.type === 'bar' ? [
                { data: data.map(item => item.count), label: this.filtros.tipoDeFiltro }
            ] : data.map(item => item.count);
            this.labelsGraph = data.map(item => item.nombre ? item.nombre : item._id);
            this.dataTable = data;

            let sum = 0;
            data.forEach((item) => sum += item.count);
            this.dataTableTotal = sum;
        }
    }
}
