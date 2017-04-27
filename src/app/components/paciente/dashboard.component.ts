import { LogService } from './../../services/log.service';
import { PacienteService } from './../../services/paciente.service';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';

@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.html'
})

export class DashboardComponent implements OnInit {

    public dashboardData: any;

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
                
            });
    }


}
