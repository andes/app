import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

import * as moment from 'moment';
import 'moment/locale/es';

@Component({
    selector: 'rup-seguimiento-del-peso',
    templateUrl: 'seguimientoDelPeso.html'
})
export class SeguimientoDelPesoComponent extends RUPComponent implements OnInit {
    // variables para guardar los pesos de las prestaciones
    public pesos: any[] = [];

    // opciones para el grafico
    public barChartOptions: any = {};
    public barChartLabels: any[];
    public barChartType = 'line';
    public barChartLegend = false;
    public barChartData: any[] = [];

    ngOnInit() {
        moment.locale('es');

        if (this.elementoRUP.conceptosBuscar && this.elementoRUP.conceptosBuscar.length > 0) {
            // set options charts
            this.setChartOptions();

            // armo el array de conceptIds a buscar en la HUDS
            const conceptIds = this.elementoRUP.conceptosBuscar.map(concepto => concepto.conceptId);

            // buscamos
            this.prestacionesService.getRegistrosEjecucion(this.paciente.id, conceptIds).subscribe(prestaciones => {

                if (prestaciones.length) {

                    // armamos array de resultados
                    this.pesos = prestaciones.map(prestacion => ({
                        // fecha: prestacion.ejecucion.fecha,
                        fecha: prestacion.ejecucion.fecha,
                        registro: prestacion.ejecucion.registros.filter(p => { return conceptIds.indexOf(p.concepto.conceptId) > -1; })
                    }));

                    // ordenamos los pesos por fecha
                    this.pesos.sort(function (a, b) {
                        let dateA = new Date(a.fecha).getTime();
                        let dateB = new Date(b.fecha).getTime();

                        return dateA > dateB ? 1 : -1;
                    });

                    // asignamos los pesos al data para el chart
                    this.barChartData = [
                        { data: this.pesos.map(p => p.registro[0].valor), label: 'kgs' }
                    ];

                    // agregamos las leyendas del eje x
                    this.barChartLabels = this.pesos.map(p => moment(p.fecha));

                    // nuevo titulo
                    this.barChartOptions.title.text += ' desde ' + moment(this.barChartLabels[0]).format('DD-MM-YYYY') + ' hasta ' + moment(this.barChartLabels[this.barChartLabels.length - 1]).format('DD-MM-YYYY');
                }
            });

        }
    }
    /**
     * Inicializamos las propiedades de la libreria para gráficos
     *
     * @private
     * @memberof SeguimientoDelPesoComponent
     */
    private setChartOptions(): void {
        this.barChartOptions = {
            scaleShowVerticalLines: false,
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Curva de peso'
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Peso (kgs)'
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'month',
                        tooltipFormat: 'LLLL',
                        displayFormats: {
                            'millisecond': 'MMM DD',
                            'second': 'MMM DD',
                            'minute': 'MMM DD',
                            'hour': 'MMM DD',
                            'day': 'MMM DD',
                            'week': 'MMM DD',
                            'month': 'MMM DD',
                            'quarter': 'MMM DD',
                            'year': 'MMM DD',
                        }
                    }
                }],
            }
        };
    }

    // Chart events (chartHover)
    public chartClicked(e: any): void { console.log(e); }

    // Chart events (chartClick)
    public chartHovered(e: any): void { console.log(e); }
}
