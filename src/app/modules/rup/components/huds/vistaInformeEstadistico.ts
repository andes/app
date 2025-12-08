import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { InformeEstadisticaService } from '../../services/informe-estadistica.service';
import { IInformeEstadistica } from '../../interfaces/informe-estadistica.interface';

@Component({
    selector: 'vista-informe-estadistico',
    templateUrl: './vistaInformeEstadistico.html',
    styleUrls: ['./vistaInformeEstadistico.scss']
})
export class VistaInformeEstadisticoComponent implements OnInit {
    @Input() informeId: string;
    @Input() paciente: IPaciente;

    public informe: IInformeEstadistica;
    public loading = true;

    constructor(
        private informeEstadisticaService: InformeEstadisticaService
    ) { }

    ngOnInit() {

        if (this.informeId) {
            this.cargarInforme();
        } else {
            this.loading = false;
        }
    }

    cargarInforme() {
        this.loading = true;

        this.informeEstadisticaService.getById(this.informeId).subscribe(
            (informe: IInformeEstadistica) => {
                this.informe = informe;
                this.loading = false;
            },
            (error) => {
                this.loading = false;
            }
        );
    }
}
