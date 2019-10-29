import { Component, OnInit, Input } from '@angular/core';
import { HUDSService } from '../../services/huds.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'vista-accesos-huds',
    templateUrl: 'vista-accesos-huds.html'
})

export class VistaAccesosHudsComponent implements OnInit {
    @Input() paciente: IPaciente;

    constructor(
        private hudsService: HUDSService
    ) { }

    public accesosHuds = [];

    ngOnInit() {
        let params = {
            fields: 'paciente'
        };
        this.hudsService.getAccesos(this.paciente.id, params).subscribe(res => {
            if (res) {
                res.forEach((documento: any) => {
                    this.accesosHuds = this.accesosHuds.concat(documento.accesos);
                });
                this.accesosHuds.sort((a, b) => moment(a.fecha) < moment(b.fecha) ? 1 : -1);
            }
        });
    }
}
