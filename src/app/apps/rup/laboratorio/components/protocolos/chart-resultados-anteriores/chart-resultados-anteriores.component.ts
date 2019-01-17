import { Component, Input, OnInit } from '@angular/core';
import { ProtocoloCacheService } from '../../../services/protocoloCache.service';


@Component({
    selector: 'chart-resultados-anteriores',
    templateUrl: 'chart-resultados-anteriores.html'
})

export class CharHistorialResultadoComponent implements OnInit {

    public chart;
    // public puntos: any[] = [];
    public barChartOptions: any = {};
    public barChartLabels: any[];
    public barChartType = 'line';
    public barChartLegend = false;
    public barChartData: any[] = [];
    public contextoCache;

    @Input() practica;

    constructor(
        public protocoloCache: ProtocoloCacheService
    ) { }


    ngOnInit() {
        this.contextoCache = this.protocoloCache.getContextoCache();
        this.contextoCache.titulo = 'Histórico de resultados: ' +  this.practica.nombre;
        this.contextoCache.botonesAccion = 'historicoResultados';
        this.generarEtiquetasCurva();
    }

    generarDatosCurva() {
        this.barChartData = [
            { data: this.practica.resultadosAnteriores.resultados.map( (e: any)  => { return e.valor; } ), label: 'Valor ()', fill: false }
        ];

        this.barChartLabels = this.practica.resultadosAnteriores.resultados.map( (e: any)  => { return moment(e.fecha).format('DD-MM-YYYY'); } );

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
                text: 'Evolución de ' + this.practica.nombre,
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Valores (' + this.practica.unidadMedida.nombre + ')',
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }]
                // ,
                // xAxes: [{
                //     type: 'time',
                //     time: {
                //         min: moment(this.practica.resultadosAnteriores.resultados[this.practica.resultadosAnteriores.resultados.length - 1].fecha).subtract(0.5, 'days'),
                //         max: moment(this.practica.resultadosAnteriores.resultados[0].fecha).add(0.5, 'days'),
                //         unit: 'month',
                //         tooltipFormat: 'DD/MM/YYYY',
                //         unitStepSize: 0.5,
                //         round: 'hour',
                //     }
                // }],
            },

            // tooltips: {
            //     callbacks: {
            //         // Use the footer callback to display the sum of the items showing in the tooltip
            //         footer: function (tooltipItems, _data) {
            //             let text = [];
            //             tooltipItems.forEach(function (tooltipItem) {
            //                 text.push('Profesional: ' + data[tooltipItem.index].profesional.nombreCompleto);
            //                 text.push('Prestación: ' + data[tooltipItem.index].tipoPrestacion.term);
            //             });

            //             return text;
            //         },
            //     }
            // }
        };
    }
}
