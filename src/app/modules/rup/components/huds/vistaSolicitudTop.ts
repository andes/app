import { Component, OnInit, Input } from '@angular/core';
import { TurnoService } from '../../../../services/turnos/turno.service';
import { HUDSService } from '../../services/huds.service';
@Component({
    selector: 'vista-solicitud-top',
    templateUrl: 'vistaSolicitudTop.html'
})

export class VistaSolicitudTopComponent implements OnInit {

    @Input() registro: any;
    @Input() paciente: any;
    turno: any;
    estado: string;
    observaciones = '';

    constructor(
        public servicioTurnos: TurnoService,
        public huds: HUDSService
    ) { }

    ngOnInit() {
        this.estado = this.registro.estados[this.registro.estados.length - 1].tipo;

        if (this.registro.estados[this.registro.estados.length - 1].observaciones) {
            this.observaciones = this.registro.estados[this.registro.estados.length - 1].observaciones;
        } else if (this.registro.estados[this.registro.estados.length - 1].motivoRechazo) { // DEPRECADO
            this.observaciones = this.registro.estados[this.registro.estados.length - 1].motivoRechazo;
        }

        if (this.registro.solicitud.turno) {
            const params = {
                id: this.registro.solicitud.turno
            };
            this.servicioTurnos.getTurnos(params).subscribe(turnos => {
                this.turno = turnos[0].bloques[0].turnos[0];
            });

        }
    }

}
