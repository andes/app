import moment from 'moment';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { ChartConfiguration, TooltipItem } from 'chart.js';

@Component({
    selector: 'rup-grafico-lineal',
    templateUrl: 'graficoLineal.html'
})
@RupElement('GraficoLinealComponent')
export class GraficoLinealComponent extends RUPComponent implements OnInit {

    @Output() hasData = new EventEmitter<boolean>();

    public cargando = true;
    public hayDatos = false;

    // opciones para el grafico
    public lineChartData: ChartConfiguration<'line'>['data'] = {
        labels: [],
        datasets: []
    };
    public barChartLabels: any[];
    public lineChartOptions: ChartConfiguration<'line'>['options'];


    ngOnInit() {
        moment.locale('es');

        const fechaDesde = this.params?.fechaDesde || null;
        const fechaHasta = this.params?.fechaHasta || null;
        const parametros = this.elementoRUP?.params || [];
        let pendientes = parametros.length;

        if (!pendientes) {
            this.cargando = false;
            this.hasData.emit(false);
            return;
        }

        const finalizarConsulta = () => {
            pendientes--;
            if (pendientes === 0) {
                this.cargando = false;
                this.hasData.emit(this.hayDatos);
            }
        };

        parametros.forEach((param) => {

            this.prestacionesService.getRegistrosHuds(this.paciente.id, `${param.query}`, fechaDesde, true, null, null, fechaHasta).subscribe({
                next: prestaciones => {
                    if (prestaciones.length) {
                        this.hayDatos = true;
                        // ordenamos los datosLineales por fecha
                        prestaciones.sort((a, b) => {
                            const dateA = new Date(a.fecha).getTime();
                            const dateB = new Date(b.fecha).getTime();

                            return dateA > dateB ? 1 : -1;
                        });

                        // asignamos los datosLineales al data para el chart
                        this.lineChartData.datasets.push({
                            data: prestaciones.map(p => p.registro.valor).filter(v => v !== null && typeof v === 'number'),
                            label: param.label,
                            fill: false,
                            type: 'line',
                            tension: 0.35,
                            cubicInterpolationMode: 'monotone',
                            pointRadius: 2
                        });

                        // agregamos las leyendas del eje x
                        this.lineChartData.labels = prestaciones.map(p =>
                            moment(p.fecha).format('DD-MM-YYYY')
                        );

                        // set options charts
                        this.setChartOptions(prestaciones);

                        if (prestaciones.length > 1) {
                            this.lineChartOptions.plugins.title.text += ' desde ' + this.lineChartData.labels[0] + ' hasta ' + this.lineChartData.labels[this.lineChartData.labels.length - 1];
                        } else {
                            this.lineChartOptions.plugins.title.text += ' al ' + this.lineChartData.labels[0];
                        }
                    }
                    finalizarConsulta();
                },
                error: () => finalizarConsulta()
            });
        });
    }

    get labels() {
        return this.elementoRUP?.params?.map(p => p.label).join(' y ') || '';
    }

    get enRango() {
        return !!(this.params?.fechaDesde || this.params?.fechaHasta);
    }

    /**
     * Inicializamos las propiedades de la libreria para gráficos
     *
     * @private
     * @param {any} data Data a utilizar para armar los tooltips
     * @memberof SeguimientoDelPesoComponent
     */
    private setChartOptions(data): void {

        this.lineChartOptions = {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                title: {
                    display: true,
                    text: `Curva de ${this.elementoRUP.params.map(x => x.label).join(' y ')}`
                },
                tooltip: {
                    callbacks: {
                        footer: (tooltipItems: TooltipItem<'line'>[]) => {
                            const text: string[] = [];
                            tooltipItems.forEach(item => {
                                const i = item.dataIndex;
                                text.push('Profesional: ' + data[i].profesional.nombreCompleto);
                                text.push('Prestación: ' + data[i].tipoPrestacion.term);
                            });
                            return text;
                        }
                    }
                },
                legend: { display: false }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: `${this.elementoRUP.params.map(x => x.label).join(' y ')} (${this.elementoRUP.params.map(x => x.unidad).join(' / ')})`,
                        font: { size: 9 }
                    }
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
