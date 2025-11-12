import moment from 'moment';
import { Component, OnInit } from '@angular/core';
import { ExportHudsService } from '../../services/export-huds.service';
import { map } from 'rxjs/operators';
import { Auth } from '@andes/auth';

@Component({
    selector: 'descargas-pendientes',
    templateUrl: './descargas-pendientes.component.html'
})

export class DescargasPendientesComponent implements OnInit {
    public completed = [];
    public pending = [];
    public sinPendientes = false;
    public fechaDesde;
    public fechaHasta;


    constructor(
        private exportHudsService: ExportHudsService,
        private auth: Auth
    ) {
        this.fechaDesde = moment().startOf('day').toDate();
        this.fechaHasta = moment().endOf('day').toDate();
    }

    ngOnInit(): void {
        this.descargasPendientes();
    }

    exportarHuds(pendiente) {
        const params = {
            id: pendiente.idHudsFiles,
            name: pendiente.pacienteNombre ? pendiente.pacienteNombre : 'HUDS',
            idHuds: pendiente.id
        };
        this.exportHudsService.descargaHuds(params).subscribe((data) => {
            if (data) {
                this.descargasPendientes();
            }
        });
    }

    descargasPendientes() {
        const query: any = { id: this.auth.usuario.id };
        if (this.fechaDesde) {
            query.fechaDesde = moment(this.fechaDesde).startOf('day').toDate();
        }
        if (this.fechaHasta) {
            query.fechaHasta = moment(this.fechaHasta).endOf('day').toDate();
        }
        this.exportHudsService.pendientes(query).subscribe((data) => {
            this.exportHudsService.hud$.next(data);
        });
        this.exportHudsService.pendiente$.pipe(
            map(prestaciones => {
                prestaciones = prestaciones.filter(prestacion => moment(prestacion.createdAt).isBetween(this.fechaDesde, this.fechaHasta, null, '[]'));
                this.completed = prestaciones.filter(prestacion => prestacion.status === 'completed');
                this.pending = prestaciones.filter(prestacion => prestacion.status === 'pending');
            })
        ).subscribe(() => {
            this.sinPendientes = this.completed.length || this.pending.length ? false : true;
        });
    }
}
