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

            // armo el array de conceptIds a buscar en la HUDS
            const conceptIds = this.elementoRUP.conceptosBuscar.map(concepto => concepto.conceptId);

            // buscamos
            this.prestacionesService.getRegistrosHuds(this.paciente.id, conceptIds).subscribe(prestaciones => {

                if (prestaciones.length) {

                    // armamos array de resultados
                    // this.pesos = prestaciones.map(prestacion => {
                    //     let registro = prestacion.ejecucion.registros.filter(p => { return conceptIds.indexOf(p.concepto.conceptId) > -1; });
                    //     return ({
                    //         // fecha: prestacion.ejecucion.fecha,
                    //         fecha: prestacion.ejecucion.fecha,
                    //         registro: registro[0],
                    //         profesional: registro[0].createdBy,
                    //         prestacion: prestacion.solicitud.tipoPrestacion.term
                    //     });
                    // });
                    this.pesos = prestaciones;

                    // ordenamos los pesos por fecha
                    this.pesos.sort(function (a, b) {
                        let dateA = new Date(a.fecha).getTime();
                        let dateB = new Date(b.fecha).getTime();

                        return dateA > dateB ? 1 : -1;
                    });

                    // asignamos los pesos al data para el chart
                    this.barChartData = [
                        { data: this.pesos.map(p => p.registro.valor), label: 'kgs', fill: false }
                    ];

                    // agregamos las leyendas del eje x
                    this.barChartLabels = this.pesos.map(p => moment(p.fecha));

                    // set options charts
                    this.setChartOptions(this.pesos);

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
     * @param {any} data Data a utilizar para armar los tooltips
     * @memberof SeguimientoDelPesoComponent
     */
    private setChartOptions(data): void {
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
                        min: moment(data[0].fecha).subtract(0.5, 'days'),
                        max: moment(data[data.length - 1].fecha).add(0.5, 'days'),
                        unit: 'day',
                        tooltipFormat: 'DD/MM/YYYY',
                        unitStepSize: 0.5,
                        round: 'hour',
                        // displayFormats: {
                        //     'millisecond': 'MMM DD',
                        //     'second': 'MMM DD',
                        //     'minute': 'MMM DD',
                        //     'hour': 'MMM DD',
                        //     'day': 'MMM DD',
                        //     'week': 'MMM DD',
                        //     'month': 'MMM DD',
                        //     'quarter': 'MMM DD',
                        //     'year': 'MMM DD',
                        // }
                    }
                }],
            },
            tooltips: {
                callbacks: {
                    // Use the footer callback to display the sum of the items showing in the tooltip
                    footer: function (tooltipItems, _data) {
                        let text = [];
                        tooltipItems.forEach(function (tooltipItem) {
                            text.push('Profesional: ' + data[tooltipItem.index].profesional.nombreCompleto);
                            text.push('Prestación: ' + data[tooltipItem.index].tipoPrestacion.term);
                        });

                        return text;
                    },
                }
            }
        };
    }

    // Chart events (chartHover)
    public chartClicked(e: any): void { console.log(e); }

    // Chart events (chartClick)
    public chartHovered(e: any): void { console.log(e); }
}
