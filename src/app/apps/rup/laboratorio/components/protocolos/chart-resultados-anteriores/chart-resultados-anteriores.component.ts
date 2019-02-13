import { Component, Input, OnInit } from '@angular/core';
import { LaboratorioContextoCacheService } from '../../../services/protocoloCache.service';


@Component({
    selector: 'chart-resultados-anteriores',
    templateUrl: 'chart-resultados-anteriores.html'
})

export class ChartHistorialResultadoComponent implements OnInit {

    public chart;
    // public puntos: any[] = [];
    public barChartOptions: any = {};
    public barChartLabels: any[];
    public barChartType = 'line';
    public barChartLegend = false;
    public barChartData: any[] = [];
    public contextoCache;

    @Input() historialResultados;

    constructor(
        public protocoloCache: LaboratorioContextoCacheService
    ) { }


    ngOnInit() {
        this.contextoCache = this.protocoloCache.getContextoCache();
        this.contextoCache.titulo = 'Histórico de resultados: ' +  this.historialResultados.practica.nombre;
        this.contextoCache.botonesAccion = 'historicoResultados';
        this.generarEtiquetasCurva();
    }

    generarDatosCurva() {
        this.barChartData = [
            { data: this.historialResultados.resultadosAnteriores.resultados.map( (e: any)  => { return e.valor; } ).reverse(), label: 'Valor ()', fill: false }
        ];

        this.barChartLabels = this.historialResultados.resultadosAnteriores.resultados.map( (e: any)  => { return moment(e.fecha).format('DD-MM-YYYY'); } );

        this.setChartOptions();
    }
    generarEtiquetasCurva() {
        this.generarDatosCurva();
    }

    /**
     * Inicializamos las propiedades de la libreria para gráficos
     *
     * @private
     * @param {any} data Data a utilizar para armar los tooltips
     * @memberof SeguimientoDelPesoComponent
     */
    private setChartOptions(): void {
        this.barChartOptions = {
            // scaleShowVerticalLines: false,
            // responsive: true,
            // maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Evolución de ' + this.historialResultados.practica.nombre,
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Valores (' + this.historialResultados.practica.unidadMedida.nombre + ')',
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }]
             }
        };
    }
}
