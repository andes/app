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
            paciente: this.paciente.id
        };
        this.hudsService.getAccesos(params).subscribe(res => {
            this.accesosHuds = res;
        });
    }
}
