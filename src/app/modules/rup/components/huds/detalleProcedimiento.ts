import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { IElementoRUP } from '../../interfaces/elementoRUP.interface';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { HUDSService } from '../../services/huds.service';
import { PrestacionesService } from '../../services/prestaciones.service';

@Component({
    selector: 'detalle-procedimiento',
    templateUrl: 'detalleProcedimiento.html',
    styleUrls: ['detalleProcedimiento.scss']
})

export class DetalleProcedimientoComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Input() registro: any;
    @Input() prestacion: IPrestacion;
    @Input() evolucionActual: any;
    @Input() indice = 0;

    elementoRUP: IElementoRUP;
    prestaciones: IPrestacion[];
    prestacionRelacionada;

    constructor(
        public prestacionesService: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        public huds: HUDSService
    ) { }

    ngOnInit() {
        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(arrayPrestaciones => {
            this.prestaciones = arrayPrestaciones;
        });

        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(prestacion => {
            this.prestacionRelacionada = prestacion.find(x => x.id === this.registro.idPrestacion);
        });
    }

    getPrestacion() {
        const tipo = 'rup';
        this.huds.toogle(this.prestacionRelacionada, tipo);
    }
}
