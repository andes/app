import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import * as moment from 'moment';
import { isNumber } from 'util';
import { RupElement } from '.';

@Component({
    selector: 'rup-grafico-lineal',
    templateUrl: 'graficoLineal.html'
})
@RupElement('GraficoLinealComponent')
export class GraficoLinealComponent extends RUPComponent implements OnInit {
    // variables para guardar los datosLineales de las prestaciones
    public datosLineales: any[] = [];

    // opciones para el grafico
    public barChartOptions: any = {};
    public barChartLabels: any[];
    public barChartType = 'line';
    public barChartLegend = false;
    public barChartData: any[] = [];
    barChartDates: any[] = [];

    ngOnInit() {
        moment.locale('es');


        this.elementoRUP.params.map((param) => {

            this.prestacionesService.getRegistrosHuds(this.paciente.id, `${param.query}`, true).subscribe(prestaciones => {

                if (prestaciones.length) {
                    // ordenamos los datosLineales por fecha
                    prestaciones.sort(function (a, b) {
                        let dateA = new Date(a.fecha).getTime();
                        let dateB = new Date(b.fecha).getTime();

                        return dateA > dateB ? 1 : -1;
                    });

                    this.barChartDates.push(
                        prestaciones.filter(y => y.registro.valor !== null && isNumber(y.registro.valor)).map(p => ({ fecha: p.fecha })),

                    );

                    // asignamos los datosLineales al data para el chart
                    this.barChartData.push(
                        { data: prestaciones.map(p => p.registro.valor).filter(y => y !== null && isNumber(y)), label: param.label, fill: false },
                    );

                    // agregamos las leyendas del eje x
                    this.barChartLabels = prestaciones.map(p => moment(p.fecha).format('DD-MM-YYYY'));
                    // set options charts
                    this.setChartOptions(prestaciones);

                    if (prestaciones.length > 1) {
                        this.barChartOptions.title.text += ' desde ' + this.barChartLabels[0] + ' hasta ' + this.barChartLabels[this.barChartLabels.length - 1];
                    } else {
                        this.barChartOptions.title.text += ' al ' + this.barChartLabels[0];
                    }

                }
            });
        });

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
            scaleShowVerticalLines: true,
            responsive: true,
            maintainAspectRatio: true,
            title: {
                display: true,
                text: `Curva de ${this.elementoRUP.params.map(x => x.label).join(' y ')}`
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        fontSize: 9,
                        display: true,
                        labelString: `${this.elementoRUP.params.map(x => x.label).join(' y ')} (${this.elementoRUP.params.map(x => x.unidad).join(' / ')})`
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [
                    {
                        ticks: {
                            suggestedMin: 1,
                            suggestedMax: 31
                        }
                    }
                ]
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
    public chartClicked(e: any): void { }

    // Chart events (chartClick)
    public chartHovered(e: any): void { }

    isEmpty() {
        return false;
    }
}
