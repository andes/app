import { Component, Input } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PacienteService } from './../../services/paciente.service';
import { SmsService } from './../../services/turnos/sms.service';
import { IPaciente } from './../../interfaces/IPaciente';


@Component({
    selector: 'turnos',
    templateUrl: 'turnos.html'
})

export class TurnosComponent {

    @Input() ag: IAgenda;
    showTurnos: boolean = true;
    numero: String = '';
    smsEnviado: boolean = false;
    smsLoader: boolean = false;
    resultado: any;

    enviarSMS(turno: any) {
        this.smsLoader = true;

        for (let x = 0; x < turno.length; x++) {
            if (turno[x].paciente != null) {

                this.smsService.enviarSms(turno[x].paciente.telefono).subscribe(
                    resultado => {
                        this.resultado = resultado;

                        if (resultado === '0') {
                            this.smsLoader = false;
                            this.smsEnviado = true;
                        } else {
                            this.smsLoader = false;
                            this.smsEnviado = false;
                        }
                    },
                    err => {
                        if (err) {
                            console.log(err);
                        }
                    });
            }
        }
    }

    constructor(public plex: Plex, public servicePaciente: PacienteService, public smsService: SmsService) { }
}
