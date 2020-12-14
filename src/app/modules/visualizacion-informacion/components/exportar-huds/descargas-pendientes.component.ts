import { Component, OnInit } from '@angular/core';
import { ExportHudsService } from '../../services/export-huds.service';
import { Observable } from 'rxjs';
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
    public busqueda$: Observable<any[]>;


    constructor(
        private exportHudsService: ExportHudsService,
        private auth: Auth
    ) { }

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
        this.exportHudsService.pendientes({ id: this.auth.usuario.id }).subscribe((data) => {
            this.exportHudsService.hud$.next(data);
        });
        this.busqueda$ = this.exportHudsService.pendiente$;
        this.busqueda$.pipe(
            map((prestaciones) => {
                this.completed = prestaciones.filter(prestacion => prestacion.status === 'completed');
                this.pending = prestaciones.filter(prestacion => prestacion.status === 'pending');
            })
        ).subscribe(() => {
            this.sinPendientes = this.completed.length || this.pending.length ? false : true;
        });
    }
}
