import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { IElementoRUP } from '../../interfaces/elementoRUP.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';

@Component({
    selector: 'vista-procedimiento',
    templateUrl: 'vistaProcedimiento.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaProcedimientoComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Input() registro: IPrestacionRegistro;
    @Input() prestacion: IPrestacion;
    @Input() evolucionActual: any;
    @Input() indice = 0;
    elementoRUP: IElementoRUP;

    constructor(public prestacionesService: PrestacionesService, public elementosRUPService: ElementosRUPService) { }

    ngOnInit() {
        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(prestacion => {
            this.prestacion = prestacion.find(x => x.id === this.registro.idPrestacion);
        });
    }

}
