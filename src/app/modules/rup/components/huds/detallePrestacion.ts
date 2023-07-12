import { Component, Input, OnInit } from '@angular/core';
import { IElementoRUP } from '../../interfaces/elementoRUP.interface';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { HUDSService } from '../../services/huds.service';

@Component({
    selector: 'detalle-prestacion',
    templateUrl: 'detallePrestacion.html',
    styleUrls: ['detallePrestacion.scss']
})

export class DetallePrestacionComponent implements OnInit {
    @Input() paciente: IPaciente;
    @Input() registro;
    @Input() prestacion: IPrestacion;
    @Input() evolucionActual;
    @Input() indice = 0;

    elementoRUP: IElementoRUP;
    prestacionOrigen;

    public relacionAux;

    constructor(
        public prestacionesService: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        public huds: HUDSService
    ) { }

    abrirSolicitud() {
        const tipo = 'rup';
        this.huds.toogle(this.prestacionOrigen, tipo);
    }

    ngOnInit() {
        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(prestacion => {
            this.prestacionOrigen = prestacion.find(x => x.id === this.registro.idPrestacion);
        });
    }
}
