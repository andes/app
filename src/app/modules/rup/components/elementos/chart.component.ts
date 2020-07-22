import { BreakpointObserver } from '@angular/cdk/layout';
import { Plex } from '@andes/plex';
import { Component, AfterViewInit, HostBinding, Input } from '@angular/core';
import { Auth } from '@andes/auth';
import { AppComponent } from './../../../../app.component';
import { IPaciente } from './../../../../core/mpi/interfaces/IPaciente';
import { PrestacionesService } from './../../../../modules/rup/services/prestaciones.service';

@Component({ selector: 'radio-chart', templateUrl: 'chart.html' })
export class ChartComponent implements AfterViewInit {
    private _paciente: IPaciente;
    public chart;
    // variables para guardar los pesos de las prestaciones
    public puntos: any[] = [];
    // opciones para el grafico
    public barChartOptions: any = {};
    public barChartLabels: any[];
    public barChartType = 'line';
    public barChartLegend = false;
    public barChartData: any[] = [];
    public mostrarChart = true;

    @HostBinding('class.plex-layout') layout = true;
    @Input()
    set paciente(value: IPaciente) {
        this._paciente = value;
        if (value) {
            this.generarEtiquetasCurva();
        }
    }
    get paciente(): IPaciente {
        return this._paciente;
    }
    public modelo = {
        radio: 1
    };
    public opciones = [
        { id: 1, label: 'Curva de Peso' },
        { id: 2, label: 'Curva de Talla' },
        { id: 3, label: 'Perímetro cefálico' },
        // { id: 4, label: 'Índice de masa corporal' },
    ];

    constructor(public auth: Auth, public appComponent: AppComponent, public prestacionesService: PrestacionesService) { }

    ngAfterViewInit() {
    }

    generarDatosCurva(expresion: string, opcionesGrafico: any) {
        this.mostrarChart = false;
        this.prestacionesService.getRegistrosHuds(this.paciente.id, expresion).subscribe(prestaciones => {
            if (prestaciones && prestaciones.length) {
                this.puntos = prestaciones;
                // ordenamos los pesos por fecha
                this.puntos.sort(function (a, b) {
                    let dateA = new Date(a.fecha).getTime();
                    let dateB = new Date(b.fecha).getTime();
                    return dateA > dateB ? 1 : -1;
                });

                // asignamos los pesos al data para el chart
                this.barChartData = [
                    { data: this.puntos.map(p => p.registro.valor), label: opcionesGrafico.unidad, fill: false }
                ];

                // agregamos las leyendas del eje x
                this.barChartLabels = this.puntos.map(p => moment(p.fecha));

                // set options charts
                this.setChartOptions(this.puntos, opcionesGrafico);

                // nuevo titulo
                this.barChartOptions.title.text += ' desde ' + moment(this.barChartLabels[0]).format('DD-MM-YYYY') + ' hasta ' + moment(this.barChartLabels[this.barChartLabels.length - 1]).format('DD-MM-YYYY');

                this.mostrarChart = true;
            }
        });
    }
    generarEtiquetasCurva() {
        let expresion;
        let opcionesGrafico = { titulo: '', labelY: '', unidad: '' };
        switch (this.modelo.radio) {
            case 1: // Peso
                expresion = '<<27113001';
                opcionesGrafico.titulo = 'Curva de Peso';
                opcionesGrafico.labelY = 'Peso (Kg)';
                opcionesGrafico.unidad = 'Kg';
                break;
            case 2: // Talla
                expresion = '<<50373000 OR 14456009';
                opcionesGrafico.titulo = 'Curva de Talla';
                opcionesGrafico.labelY = 'Talla (cm)';
                opcionesGrafico.unidad = 'cm';
                break;
            case 3: // Perimetro cefalico
                expresion = '363812007';
                opcionesGrafico.titulo = 'Perímetro cefálico';
                opcionesGrafico.labelY = 'Perímetro cefálico (cm)';
                opcionesGrafico.unidad = 'cm';
                break;
            case 4: // IMC
                expresion = '60621009';
                opcionesGrafico.titulo = 'Índice de masa corporal';
                opcionesGrafico.labelY = 'Índice de masa corporal';
                opcionesGrafico.unidad = '-';
                break;
        }
        this.generarDatosCurva(expresion, opcionesGrafico);
    }

    /**
     * Inicializamos las propiedades de la libreria para gráficos
     *
     * @private
     * @param {any} data Data a utilizar para armar los tooltips
     * @memberof SeguimientoDelPesoComponent
     */
    private setChartOptions(data, opcionesGrafico): void {
        this.barChartOptions = {
            scaleShowVerticalLines: false,
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: opcionesGrafico.titulo,
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: opcionesGrafico.labelY,
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
                        unit: 'month',
                        tooltipFormat: 'DD/MM/YYYY',
                        unitStepSize: 0.5,
                        round: 'hour',
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

    isEmpty() {
        return false;
    }
}
