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
    // telefonos: String[] = [];

    enviarSMS(turno: any) {

        for (let x = 0; x < turno.length; x++) {
            if (turno[x].paciente != null) {
                // this.telefonos.push(turno[x].paciente.telefono);

                this.smsService.enviarSms(turno[x].paciente.telefono).subscribe(resultado => {
                    this.plex.alert('El sms se envío correctamente');
                });
            }
        }

        // this.smsService.enviarSms(this.telefonos).subscribe(resultado => {
        //     this.plex.alert('El sms se envío correctamente');
        // });
    }

    constructor(public plex: Plex, public servicePaciente: PacienteService, public smsService: SmsService) { }
}
