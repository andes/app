import * as moment from 'moment';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { EstRupService } from '../../services/rup-estadisticas.service';
import { SnomedService } from '../../../../services/term/snomed.service';

@Component({
    templateUrl: 'rup-pacientes.html'
})
export class RupPacientesComponent implements AfterViewInit {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();

    public detallar = true;
    public prestacion: any;
    public prestaciones = [];
    public prestacionesHijas = [];
    public filtros = {

    };

    constructor(public estService: EstRupService, public snomed: SnomedService) { }

    ngAfterViewInit() {
        this.snomed.getQuery({expression: '<1651000013107'}).subscribe((result) => {
            this.prestaciones = result;
        });
    }

    onPrestacionChange () {
        this.snomed.getQuery({expression: '<<'  + this.prestacion.conceptId }).subscribe((result) => {
            result.forEach((item) => { item.check = true; });
            this.prestacionesHijas = result;
        });
    }

    onChange() {
        let prestaciones = this.prestacionesHijas.filter(item => item.check).map(item => item.conceptId);
        this.estService.get({ desde: this.desde, hasta: this.hasta, prestaciones }).subscribe((resultados) => {
            console.log(resultados);
        });
    }
}
