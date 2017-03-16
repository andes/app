import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { ListaEsperaService } from '../../services/turnos/listaEspera.service';
import { AgendaService } from '../../services/turnos/agenda.service';
import { SmsService } from './../../services/turnos/sms.service';

@Component({
    selector: 'suspender-turno',
    templateUrl: 'suspender-turno.html'
})

export class SuspenderTurnoComponent implements OnInit {

    @Input() agenda: IAgenda;
    @Input() pacientesSeleccionados: ITurno;

    @Output() saveSuspenderTurno = new EventEmitter<IAgenda>();
    @Output() reasignarTurnoSuspendido = new EventEmitter<boolean>();

    pacientes: any = [];
    showSuspenderTurno: boolean = true;
    resultado: any;

    public reasignar: any = {};

    public motivoSuspension: any[];
    public motivoSuspensionSelect = { select: null };

    ngOnInit() {
        this.pacientes = this.pacientesSeleccionados;

        this.motivoSuspension = [{
            id: 1,
            nombre: 'Edilicia'
        }, {
            id: 2,
            nombre: 'Profesional'
        },
        {
            id: 3,
            nombre: 'Organizacion'
        }];

        this.motivoSuspensionSelect.select = this.motivoSuspension[1];
    }

    suspenderTurno() {

        for (let x = 0; x < this.pacientes.length; x++) {
            let patch = {
                'op': 'suspenderTurno',
                'idTurno': this.pacientes[x].id,
                'motivoSuspension': this.motivoSuspensionSelect.select.nombre
            };

            this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {

            },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
        }
    }

    agregarPacienteListaEspera() {

        for (let x = 0; x < this.pacientes.length; x++) {
            let patch = {
                'op': 'listaEsperaSuspensionAgenda',
                'idAgenda': this.agenda.id,
                'pacientes': this.pacientes[x]
            };

            this.suspenderTurno();

            this.listaEsperaService.postXIdAgenda(this.agenda.id, patch).subscribe(resultado => {

                this.serviceAgenda.getById(this.agenda.id).subscribe(resulAgenda => {

                    this.saveSuspenderTurno.emit(resulAgenda);

                    this.plex.alert('Los pacientes seleccionados pasaron a Lista de Espera');
                })

            });
        }
    }

    reasignarTurno(paciente: any) {
        debugger;
         this.reasignar = { 'paciente': paciente.paciente, 'idTurno': paciente.id, 'idAgenda': this.agenda.id };

        this.suspenderTurno();

        this.enviarSMS(paciente);

        this.reasignarTurnoSuspendido.emit(this.reasignar);
    }

    enviarSMS(paciente: any) {
        // this.smsLoader = true;

        this.smsService.enviarSms(paciente.paciente.telefono).subscribe(
            resultado => {
                this.resultado = resultado;
                // this.smsLoader = false;
                debugger;
                // if (resultado === '0') {
                //     this.pacientesSeleccionados[x].smsEnviado = true;
                // } else {
                //     this.pacientesSeleccionados[x].smsEnviado = false;
                // }
            },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    constructor(public plex: Plex, public listaEsperaService: ListaEsperaService, public serviceAgenda: AgendaService, public smsService: SmsService) { }
}