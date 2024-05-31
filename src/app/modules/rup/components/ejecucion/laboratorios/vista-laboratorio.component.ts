import { Component, Input, OnInit } from '@angular/core';
import { LaboratorioService } from 'projects/portal/src/app/services/laboratorio.service';

@Component({
    selector: 'vista-laboratorio',
    templateUrl: 'vista-laboratorio.html',
    styleUrls: ['vista-laboratorio.scss'],
})

export class VistaLaboratorioComponent implements OnInit {

    constructor(private laboratorioService: LaboratorioService) { }

    public gruposLaboratorio;
    public laboratorios: any = {};

    @Input() protocolo;
    @Input() index: number;

    ngOnInit(): void {
        const id = this.protocolo.data.idProtocolo;

        this.laboratorioService.getByProtocolo(id).subscribe((resultados) => {
            this.laboratorios = this.groupByArea(resultados[0].Data);
            this.gruposLaboratorio = Object.keys(this.laboratorios);
        });

    }

    public groupByArea(data: any): { [key: string]: any[] } {
        return data?.reduce((acc, item) => {
            if (!acc[item.grupo]) {
                acc[item.grupo] = [];
            }
            acc[item.grupo].push(item);
            return acc;
        }, {} as { [key: string]: any[] });
    }
}
