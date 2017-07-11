import { Component, Input, OnInit, Output, EventEmitter, HostBinding, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';

// Interfaces
import { IAgenda } from '../../../interfaces/turnos/IAgenda';

// Servicios
import { AgendaService } from '../../../services/turnos/agenda.service';

@Component({
    selector: 'dashboard-codificacion',
    templateUrl: 'dashboard-codificacion.html'
})

export class DashboardCodificacionComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    public fechaDesde: any;
    public fechaHasta: any;
    public agendasCodificar: any = [];
    public autorizado = false;
    showAgendasACodificar = true;
    public today = false;

    constructor(
        public serviceAgenda: AgendaService, public auth: Auth,
        private router: Router,
        private plex: Plex) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        // No está autorizado para ver esta pantalla
        if (!this.autorizado) {
            this.redirect('inicio');
        } else {
            let fecha = moment().format();
            this.fechaDesde =moment(fecha).startOf('month');
            this.fechaHasta = moment(fecha).endOf('day');

            this.loadAgendas();
        }
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    volverAlDashboard() {
        this.loadAgendas();
    }

    loadAgendas() {

        this.serviceAgenda.get({
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            organizacion: this.auth.organizacion._id,
            idTipoPrestacion: '',
            idProfesional: '',
            idEspacioFisico: ''
        }).subscribe(
            agendas => {
                this.agendasCodificar = agendas;
            },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }
}
