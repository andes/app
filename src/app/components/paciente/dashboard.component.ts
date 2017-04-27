import { LogService } from './../../services/log.service';
import { PacienteService } from './../../services/paciente.service';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';

@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.html',
    styleUrls: ['dashboard.css']
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
                this.dashboardData = data;
                console.log(this.dashboardData);
                this.loadPatientData();
                this.loadLogData();
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
