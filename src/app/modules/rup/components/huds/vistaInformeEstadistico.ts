import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { InformeEstadisticaService } from '../../services/informe-estadistica.service';
import { IInformeEstadistica } from '../../interfaces/informe-estadistica.interface';

@Component({
    selector: 'vistaInformeEstadistico',
    template: `
        <div class="rup-card">
            <div class="rup-header">
                <div class="icon-rup">
                    <i class="adi document"></i>
                </div>

                <div class="title">
                    <b>Informe Estadístico de Internación</b>

                    <div class="sub">
                        Fecha del informe:
                        {{ informe?.informeIngreso?.fechaIngreso | date:'dd/MM/yyyy HH:mm' }}
                    </div>
                </div>
            </div>

            <div class="rup-body">
                <div class="content">
                    <div class="row">
                        <div class="col-6">
                            <b>Diagnóstico Principal</b><br>
                            {{ informe?.informeEgreso?.diagnosticos?.principal?.term || 'Sin datos' }}
                        </div>

                        <div class="col-6">
                            <b>Días de Internación</b><br>
                            {{ informe?.informeEgreso?.diasDeEstada || 'N/A' }}
                        </div>
                    </div>

                    <div class="row mt-2">
                        <div class="col-12">
                            <b>Motivo de Internación</b><br>
                            {{ informe?.informeIngreso?.motivo || 'Sin datos' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})

export class VistaInformeEstadisticoComponent implements OnInit {
    @Input() informeId: string;
    @Input() paciente: IPaciente;
    @Input() informe: IInformeEstadistica;

    public loading = true;

    constructor(private informeEstadisticaService: InformeEstadisticaService) { }

    ngOnInit() {
        if (this.informeId && !this.informe) {
            this.cargarInforme();
        } else {
            this.loading = false;
        }
    }

    cargarInforme() {
        this.loading = true;
        this.informeEstadisticaService.getById(this.informeId).subscribe(
            (informe) => {
                this.informe = informe;
                this.loading = false;
            },
            (err) => {
                this.loading = false;
            }
        );
    }
}
