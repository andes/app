import { Component, Input, OnChanges, AfterViewChecked } from '@angular/core';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { HUDSService } from '../../services/huds.service';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';

@Component({
    selector: 'rup-relaciones',
    templateUrl: './relaciones-rup.html',
    styleUrls: ['./relaciones-rup.scss']
})
export class RupRelacionesComponent implements AfterViewChecked {

    @Input() registros: IPrestacionRegistro[];

    registrosRelaciones: any = {};

    constructor(private huds: HUDSService) { }

    ngAfterViewChecked() {
        if (this.registros) {
            this.registrosRelaciones = this.huds.armarRelaciones(this.registros);
        }
    }


}
