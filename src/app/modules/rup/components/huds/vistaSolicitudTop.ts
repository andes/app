import { Component, OnInit, Input } from '@angular/core';
import { TurnoService } from '../../../../services/turnos/turno.service';

@Component({
    selector: 'vista-solicitud-top',
    templateUrl: 'vistaSolicitudTop.html'
})

export class VistaSolicitudTopComponent implements OnInit {

    @Input() registro: any;
    turno: any;
    estado: string;
    motivoRechazo = '';

    constructor(
        public servicioTurnos: TurnoService,
    ) { }

    ngOnInit() {
        this.estado = this.registro.estados[this.registro.estados.length - 1].tipo;
        if (this.estado === 'rechazada') {
            this.motivoRechazo = this.registro.estados[this.registro.estados.length - 1].motivoRechazo;
        }
        console.log('estado ', this.estado);
        if (this.registro.solicitud.turno) {
            let params = {
                id: this.registro.solicitud.turno
            };
            this.servicioTurnos.getTurnos(params).subscribe(turnos => {
                this.turno = turnos[0].bloques[0].turnos[0];
            });

        }
    }

}
