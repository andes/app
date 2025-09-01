import { Component, Input, ViewChildren } from '@angular/core';
import { EstAgendasService } from '../../services/agenda.service';
import { Plex } from '@andes/plex';


@Component({
    templateUrl: 'graficos.html',
    selector: 'graph-table',
    styles: [`
        .graphPadre {
            position: relative;
            width: 80%;
        }
        .graphHijo {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 45%;
        }
    `]
})

export class GraficosComponent {
    private _data: any;
    @Input() titulo = '';
    @Input() type = 'bar';

    @Input()
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

    @ViewChildren('extradata') extradata: any;

    public leyenda = '';
    private DATA_MAX = 20;
    public dataTable = [];
    public dataGraph = [];
    public labelsGraph = [];
    public dataTableTotal = 0;
    public requestInProgress: boolean;
    public extraTitle = '';
    public extras;
    public extraLabels = [];
    public extraData = [];

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

    constructor(public estService: EstAgendasService, private plex: Plex) { }

    descargar(value) {
        if (this.filtros) {
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

    changeShowExtras(active: any) {
        this.extras = this.dataTable.find(item => item.nombre === active[0]?._model.label)?.extras;
        if (this.extras?.length) {
            this.extraLabels = this.extras.map(item => item.nombre);
            this.extraData = this.extras.map(item => item.count);
            this.extraTitle = this.extraTitle === active[0]._model.label ? '' : active[0]._model.label;
        }
    }

    cargarResultados(data) {
        if (data && data.length > 0 && data[0].count > 0 && this.filtros) {
            this.extras = null;
            this.extraTitle = '';
            if (this.type === 'bar') {
                this.leyenda = '';
                if (data.length > this.DATA_MAX) {
                    this.leyenda = `(Se muestran ${this.DATA_MAX} de ${data.length})`;
                    data = data.slice(0, this.DATA_MAX);
                }
                this.dataGraph = [
                    { data: data.map(item => item.count), label: this.filtros.tipoDeFiltro }
                ];
            } else {
                this.dataGraph = data.map(item => item.count);
            }

            this.labelsGraph = data.map(item => item.nombre ? item.nombre : item._id);
            this.dataTable = data;

            let sum = 0;
            data.forEach((item) => sum += item.count);
            this.dataTableTotal = sum;
        }
    }
}
