import { Component, ViewEncapsulation, Input } from '@angular/core';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { IPaciente } from '../../../../interfaces/IPaciente';

@Component({
    selector: 'vista-prestacion',
    templateUrl: 'vistaPrestacion.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaPrestacionComponent {

    @Input() paciente: IPaciente;
    // @Input() registro: IPrestacionRegistro;
    @Input() prestacion: IPrestacion;
    @Input() evolucionActual: any;
    @Input() indice = 0;

    constructor(public prestacionesService: PrestacionesService, public elementosRUPService: ElementosRUPService) {
    }

    getTimestamp(fecha) {
        return fecha.getTime();
    }

}
