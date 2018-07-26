import * as moment from 'moment';
import { Component, AfterViewInit, HostBinding } from '@angular/core';
import { EstRupService } from '../../services/rup-estadisticas.service';
import { SnomedService } from '../../services/snomed.service';

@Component({
    templateUrl: 'rup-pacientes.html',
    styleUrls: ['rup-pacientes.scss']
})
export class RupPacientesComponent implements AfterViewInit {
    @HostBinding('class.plex-layout') layout = true;

    showData = false;

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

    public registros = [];
    public tablas: any = [];

    constructor(public estService: EstRupService, public snomed: SnomedService) { }

    ngAfterViewInit() {
        this.snomed.getQuery({ expression: '<1651000013107' }).subscribe((result) => {
            this.prestaciones = result;
        });
    }

    onPrestacionChange() {
        this.snomed.getQuery({ expression: '<<' + this.prestacion.conceptId }).subscribe((result) => {
            result.forEach((item) => { item.check = true; });
            this.prestacionesHijas = result;
        });
    }

    onChange() {
        if (this.prestacion) {
            this.tablas = [];
            this.registros = [];

            let prestaciones = this.prestacionesHijas.filter(item => item.check).map(item => item.conceptId);
            this.estService.get({ desde: this.desde, hasta: this.hasta, prestaciones }).subscribe((resultados) => {
                this.showData = true;
                if (this.detallar) {
                    this.createTable(this.prestacionesHijas.filter(item => item.check), resultados.pacientes);
                }
                this.crearTotales(this.prestacionesHijas, resultados.pacientes);
                this.registros = resultados.registros;
            });
        }

    }

    /*
        decada: 7
        sexo: "femenino"
    */

    createTable(prestaciones, data) {
        prestaciones.forEach((prestacion) => {
            let items = data.filter(item => item.prestacion.conceptId === prestacion.conceptId);
            if (items.length > 0) {
                let info = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

                items.forEach((item) => {
                    let d = item._id.decada > 9 ? 9 : item._id.decada;
                    let s = item._id.sexo === 'masculino' ? 0 : 1;

                    info[s][d] += item.count;
                    info[s][10] += item.count; // total file
                    info[2][d] += item.count; // total columna
                    info[2][10] += item.count; // total prestacion
                });


                let table = {
                    prestacion: prestacion,
                    data: info
                };

                this.tablas.push(table);

            }
        });
    }

    crearTotales(prestaciones, data) {
        let info = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
        prestaciones.forEach((prestacion) => {
            let items = data.filter(item => item.prestacion.conceptId === prestacion.conceptId);
            if (items.length > 0) {

                items.forEach((item) => {
                    let d = item._id.decada > 9 ? 9 : item._id.decada;
                    let s = item._id.sexo === 'masculino' ? 0 : 1;

                    info[s][d] += item.count;
                    info[s][10] += item.count; // total file
                    info[2][d] += item.count; // total columna
                    info[2][10] += item.count; // total prestacion
                });
            }
        });
        let table = {
            prestacion: { term: this.detallar ? 'Totalizado' : this.prestacion.term },
            data: info
        };

        this.tablas.push(table);
    }

    buscarRelaciones(row) {
        let names = [];
        row.relaciones.forEach((item) => {
            this.registros.forEach((reg) => {
                let i = reg.ids.indexOf(item);
                if (i >= 0) {
                    names.push(reg.concepto.term);
                }
            });
        });
        return names;
    }

}
