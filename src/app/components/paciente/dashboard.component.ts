import { LogService } from './../../services/log.service';
import { PacienteService } from './../../services/paciente.service';
import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';

@Component({
    selector: 'pacientes-dashboard',
    templateUrl: 'dashboard.html',
    styleUrls: ['dashboard.scss']
})


export class DashboardComponent implements OnInit {
    private dashboardData: any;
    private validados = 0;
    private scansFallidos = 0;
    private temporales = 0;
    private posiblesDuplicados = 0;
    private macheoAlto = 0;
    private scan = 0;
    private insert = 0;
    private update = 0;
    private query = 0;

    // Propiedades públicas
    public loading = true;
    public chart = {
        maxPoints: 10,
        datasets: [{
            data: [0, 0, 0, 0]
        }],
        labels: ['Validado', 'Temporales', 'Escaneos correctos', 'Escaneos fallidos'],
        options: {
            animation: {
                animateRotate: true,
                animateScale: false,
            }
        },
        colors: [{
            backgroundColor: [
                '#8CC63F',
                '#ff8d22',
                '#00A8E0',
                '#dd4b39'
            ]
        }],
    };

    // Parámetros
    @Input() showCharts = false;

    constructor(
        private plex: Plex,
        private server: Server,
        private logService: LogService,
        private pacienteService: PacienteService) {
    }

    ngOnInit() {
        this.getDashboard();
    }

    private getDashboard() {
        this.pacienteService.getDashboard()
            .subscribe(data => {
                this.loading = false;
                this.dashboardData = data;
                this.loadPatientData();
                this.loadLogData();
                this.chart.datasets[0].data[0] = this.validados;
                this.chart.datasets[0].data[1] = this.temporales;
                this.chart.datasets[0].data[2] = this.scan;
                this.chart.datasets[0].data[3] = this.scansFallidos;
            });
    }

    private loadPatientData() {
        this.dashboardData.paciente.forEach((data) => {
            if (data._id.estado === 'validado') {
                this.validados = this.validados + data.count;
            } else {
                this.temporales = data.count;
            }
        });
        this.validados = this.validados + this.dashboardData.pacienteMpi[0].count;
    }

    private loadLogData() {
        this.dashboardData.logs.forEach((data) => {
            switch (data._id.operacion) {
                case 'scanFail':
                    this.scansFallidos = data.count;
                    break;
                case 'posibleDuplicado':
                    this.posiblesDuplicados = data.count;
                    break;
                case 'macheoAlto':
                    this.macheoAlto = data.count;
                    break;
                case 'scan':
                    this.scan = data.count;
                    break;
                case 'insert':
                    this.insert = data.count;
                    break;
                case 'update':
                    this.update = data.count;
                    break;
                case 'query':
                    this.query = data.count;
                    break;
            }
        });
    }


}
