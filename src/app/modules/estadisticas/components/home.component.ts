import * as moment from 'moment';

import { Observable } from 'rxjs/Rx';
import { Component, AfterViewInit, HostBinding } from '@angular/core';

import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

import { EstAgendasService } from '../services/agenda.service';

@Component({
    templateUrl: 'home.html',
    styleUrls: ['home.scss']
})
export class HomeComponent implements AfterViewInit {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();
    public organizacion;

    // Datos
    public data: any;

    public sexoLabels = [];
    public sexoData = [];

    public edadLabels = [];
    public edadData = [];

    constructor(private plex: Plex, public auth: Auth, public estService: EstAgendasService) { }

    ngAfterViewInit() {
        this.organizacion = this.auth.organizacion;
        this.filter();
    }

    filter () {
        this.sexoLabels = [];
        this.sexoData = [];
        this.edadLabels = [];
        this.edadData = [];

        let params = {
            organizacion: this.organizacion.id,
            fechaDesde: this.desde,
            fechaHasta: this.hasta
        };
        this.estService.get(params).subscribe((data) => {
            this.data = data[0];
            if (this.data.sexo) {
                this.data.sexo.forEach((item) => {
                    this.sexoLabels.push(item._id);
                    this.sexoData.push(item.total);
                });
            }

            if (this.data.edad) {
                this.data.edad.forEach((item) => {
                    this.edadLabels.push(item._id);
                    this.edadData.push(item.count);
                });
            }

        });

    }
}
