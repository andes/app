import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PacienteService } from './../../services/paciente.service';
import { SmsService } from './../../services/turnos/sms.service';
import { AgendaService } from '../../services/turnos/agenda.service';
import { ListaEsperaService } from '../../services/turnos/listaEspera.service';

@Component({
    selector: 'turnos',
    templateUrl: 'turnos.html'
})

export class TurnosComponent implements OnInit {
    public title: string = 'Liberar Turno';
    public message: string = 'Está seguro que desea Liberar el Turno? </br> Un SMS se enviará automáticamente al paciente.';
    public confirmaLiberarTurno: boolean = false;
    public confirmaSuspenderTurno: boolean = false;
    public cancelClicked: boolean = false;

    @Input() ag: IAgenda;
    @Input() reasturnos: IAgenda;

    @Output() reasignaTurno = new EventEmitter<boolean>();

    showTurnos: boolean = true;

    // smsEnviado: boolean = false;
    smsLoader: boolean = false;
    resultado: any;

    listaEspera: any;
    tablaTurnos: boolean = false;
    pacienteCancelado: String;

    public pacientesSeleccionados: any[] = [];

    public turnos = [];
    private _selectAll;

    public reasignar: any = {};

    ngOnInit() {
        this.turnos = this.ag.bloques[0].turnos;
        debugger;
        this.turnos.forEach(turno => {
            turno.smsEnviado = false;

            turno.listaEspera = true;
            turno.verNota = true;
        });
    }

    @Input()
    public get selectAll() {
        return this._selectAll;
    }
    public set selectAll(value) {
        if (!this.turnos) {
            return;
        }

        this.pacientesSeleccionados = [];

        this.turnos = this.turnos.filter(
            pac => pac.paciente != null);

        this.turnos.forEach(turno => {
            turno.checked = value;

            if (value) {
                this.pacientesSeleccionados.push(turno);
            }
        });

        this._selectAll = value;
    }

    agregarPaciente(turno) {

        this._selectAll = false;

        if (this.pacientesSeleccionados.find(x => x.paciente === turno.paciente)) {
            this.pacientesSeleccionados.splice(this.pacientesSeleccionados.indexOf(turno), 1);
            turno.checked = false;
        } else {
            this.pacientesSeleccionados.push(turno);
            turno.checked = true;
        }
    }

    @Input()
    public confirm(agenda: IAgenda, turno: any, event) {
        debugger;
        alert("Confirma");
    }

    eventosTurno(agenda: IAgenda, turno: any, event) {
        debugger;
        let btnClicked;

        if (event.currentTarget)
            btnClicked = event.currentTarget.id;

        let patch: any = {};

        if (this.confirmaLiberarTurno) {
            patch = {
                'op': 'liberarTurno',
                'idTurno': turno.id
            };

            turno.asistenciaVisible = true;
            turno.disponibleVisible = true;
            turno.suspenderVisible = true;
            turno.liberarVisible = true;
            turno.bloquearVisible = true;
            turno.verNota = true;

            this.smsLoader = true;
            turno.reasignarVisible = false;
            turno.listaEspera = false;

            this.confirmaLiberarTurno = false;

            this.pacientesSeleccionados.push(turno);
            this.enviarSMS();
        } else if ((btnClicked === 'darAsistencia') || (btnClicked === 'sacarAsistencia')) {
            patch = {
                'op': 'asistenciaTurno',
                'idTurno': turno.id
            };
        } else if (btnClicked === 'bloquearTurno') {
            patch = {
                'op': 'bloquearTurno',
                'idTurno': turno.id
            };
        } else if (this.confirmaSuspenderTurno) {
            patch = {
                'op': 'suspenderTurno',
                'idTurno': turno.id
            };

            this.confirmaSuspenderTurno = false;
        }

        this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
            this.ag = resultado;
            // this.turnos = this.ag.bloques;

            // this.turnos.forEach(turno => {
            //     turno.turnos.forEach(turno => {
            //         turno.asistenciaVisible = true;
            //         turno.disponibleVisible = true;
            //         turno.suspenderVisible = true;
            //         turno.liberarVisible = true;
            //         turno.bloquearVisible = true;
            //         turno.verNota = true;

            //         turno.reasignarVisible = false;
            //         turno.listaEspera = false;
            //         // turno.reasignarVisible = false;
            //         // turno.listaEspera = false;
            //     });
            // });
        },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    reasignarTurno(paciente: any, idTurno: any, idAgenda: any) {
        this.reasignar = { 'paciente': paciente, 'idTurno': idTurno, 'idAgenda': idAgenda };

        this.reasignaTurno.emit(this.reasignar);
    }

    agregarPacienteListaEspera(agenda: any, paciente: any) {
        let patch: any = {};
        let pacienteListaEspera = {};

        if (paciente) {
            pacienteListaEspera = paciente;
        } else {
            pacienteListaEspera = this.pacientesSeleccionados;
        }

        patch = {
            'op': 'listaEsperaSuspensionAgenda',
            'idAgenda': agenda.id,
            'pacientes': pacienteListaEspera
        };

        this.listaEsperaService.postXIdAgenda(agenda.id, patch).subscribe(resultado => {
            agenda = resultado;
            //this.ag.bloques = agenda.bloques;
            this.plex.alert('El paciente paso a Lista de Espera');
            debugger;
        });
    }

    enviarSMS() {
        this.smsLoader = true;

        for (let x = 0; x < this.pacientesSeleccionados.length; x++) {
            if (this.pacientesSeleccionados[x].paciente != null) {

                this.smsService.enviarSms(this.pacientesSeleccionados[x].paciente.telefono).subscribe(
                    resultado => {
                        this.resultado = resultado;
                        this.smsLoader = false;
                        debugger;
                        if (resultado === '0') {
                            this.pacientesSeleccionados[x].smsEnviado = true;
                        } else {
                            this.pacientesSeleccionados[x].smsEnviado = false;
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

    agregarNota(turno: any) {
        debugger;
        if (turno.verNota) {
            // turno.hidden = true;
            turno.asistenciaVisible = true;
            turno.disponibleVisible = true;
            turno.suspenderVisible = true;
            turno.liberarVisible = true;
            turno.bloquearVisible = true;
            turno.reasignarVisible = true;

            turno.verNota = false;
        } else {
            // turno.hidden = false;
            turno.asistenciaVisible = false;
            turno.disponibleVisible = false;
            turno.suspenderVisible = false;
            turno.liberarVisible = false;
            turno.bloquearVisible = false;
            turno.reasignarVisible = false;

            turno.verNota = true;
        }
    }

    guardarNota(agenda: any, turno: any) {
        let patch: any = {};

        patch = {
            'op': 'guardarNotaTurno',
            'idAgenda': agenda.id,
            'idTurno': turno.id,
            'textoNota': turno.nota
        };

        this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
            this.agregarNota(turno);
        },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    constructor(public plex: Plex, public servicePaciente: PacienteService, public smsService: SmsService,
        public serviceAgenda: AgendaService, public listaEsperaService: ListaEsperaService) { }
}
