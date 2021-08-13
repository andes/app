import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { IElementoRUP } from '../../interfaces/elementoRUP.interface';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { HUDSService } from '../../services/huds.service';
import { PrestacionesService } from '../../services/prestaciones.service';

@Component({
    selector: 'vista-procedimiento',
    templateUrl: 'vistaProcedimiento.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaProcedimientoComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Input() registro: any;
    @Input() prestacion: IPrestacion;
    @Input() evolucionActual: any;
    @Input() indice = 0;

    elementoRUP: IElementoRUP;
    public relacionAux;

    constructor(
        public prestacionesService: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        public huds: HUDSService
    ) { }

    ngOnInit() {
        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(prestacion => {
            this.prestacion = prestacion.find(x => x.id === this.registro.idPrestacion);
            this.buscarRelacion();
        });
    }

    buscarRelacion() {
        const relacionInvertida = this.prestacion.ejecucion.registros.find(r => {
            return r.relacionadoCon.some(rl => rl.concepto.conceptId === this.registro.concepto.conceptId);
        });

        if (relacionInvertida) {
            this.relacionAux = relacionInvertida;
        } else {
            if (this.registro.evoluciones[this.indice]?.relacionadoCon[0]?.concepto.conceptId === '1921000013108') {
                this.relacionAux = this.registro.evoluciones[this.indice].relacionadoCon[0];
            } else {
                this.relacionAux = null;
            }
        }
    }

    abrirSolicitud() {
        this.huds.toogle(
            (this.registro as any).dataPrestacion,
            'rup'
        );
    }
}
