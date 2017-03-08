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
    /*Propiedades del PopOver para confirmar acciones en Turnos*/
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
    // smsLoader: boolean = false;
    resultado: any;

    listaEspera: any;
    tablaTurnos: boolean = false;
    pacienteCancelado: String;

    accionesTurnosAsignado: any = {};
    accionesTurnosDisponibles: any = {};
    accionesDarAsistencia: any = {};


    public pacientesSeleccionados: any[] = [];

    public turnos = [];
    public bloques = [];

    private _selectAll;

    public reasignar: any = {};

    ngOnInit() {
        this.turnos = this.ag.bloques[0].turnos;

        this.accionesTurnosVsible(this.turnos);

        // this.accionesTurnosAsignado = [
        //     { 'accion': 'nombrePacienteVisible', 'value': false },
        //     { 'accion': 'tdAsistencias', 'value': false },
        //     { 'accion': 'darAsistenciaVisible', 'value': false },
        //     { 'accion': 'suspenderTurnoVisible', 'value': false },
        //     { 'accion': 'liberarTurnoVisible', 'value': false },
        //     { 'accion': 'bloquearTurnoDeshabilitadoVisible', 'value': false },
        //     { 'accion': 'reasignarTurnoVisible', 'value': false },
        //     { 'accion': 'verNota', 'value': false }
        // ]

        // this.accionesTurnosDisponibles = [
        //     { 'accion': 'darAsistencia', 'value': true },
        //     { 'accion': 'sacarAsistencia', 'value': true },
        //     { 'accion': 'estadoDisponibleVisible', 'value': false },
        //     { 'accion': 'disponibleVisible', 'value': false },
        //     { 'accion': 'suspenderTurnoDeshabilitadoVisible', 'value': false },
        //     { 'accion': 'liberarTurnoDeshabilitadoVisible', 'value': false },
        //     { 'accion': 'bloquearTurnoVisible', 'value': false },
        //     { 'accion': 'reasignarTurnoDeshabilitadoVisible', 'value': false },
        //     { 'accion': 'verNota', 'value': false }
        // ]

        // this.setAccionesTurnosInicio(this.turnos, this.accionesTurnosAsignado);
        // this.setAccionesTurnosInicio(this.turnos, this.accionesTurnosDisponibles);
        this.setAccionesTurnosInicio(this.turnos);
    }

    setAccionesTurnosInicio(turnos: any) {
        for (let t = 0; t < turnos.length; t++) {

            this.accionesTurnosVsible(turnos[t]);

            if (this.ag.estado != 'suspendida') {
                if (turnos[t].paciente) {
                    this.turnoAsignado(turnos[t]);
                } else {
                    this.turnoDisponible(turnos[t]);
                }
            }

        }
    }

    // setAccionesTurnosInicio(turnos: any, accionesTurnos) {
    //     debugger;
    //     var keyAccionTurno = [];

    //     if (turnos.length > 0)
    //         keyAccionTurno = Object.keys(turnos[0]);
    //     else
    //         keyAccionTurno = Object.keys(turnos);

    //     for (let t = 0; t < turnos.length; t++) {

    //         for (var x = 0; x < accionesTurnos.length; x++) {

    //             for (var i = 0; i < keyAccionTurno.length; i++) {

    //                 if (this.ag.estado != 'suspendida') {

    //                     if (turnos[t].paciente) {

    //                         for (var x = 0; x < accionesTurnos.length; x++) {
    //                             if (keyAccionTurno[i] === accionesTurnos[x].accion) {
    //                                 this.mostrarAcciones(accionesTurnos[x].accion, accionesTurnos[x].value, turnos[t]);
    //                             }
    //                         }

    //                     } else {
    //                         for (var x = 0; x < accionesTurnos.length; x++) {
    //                             if (keyAccionTurno[i] === accionesTurnos[x].accion) {

    //                                 this.mostrarAcciones(accionesTurnos[x].accion, accionesTurnos[x].value, turnos[t]);

    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    mostrarAcciones(boton, value, turno) {
        debugger;
        if (boton === 'nombrePacienteVisible')
            turno.nombrePacienteVisible = value;

        if (boton === 'estadoDisponibleVisible')
            turno.estadoDisponibleVisible = value;

        if (boton === 'tdAsistencias')
            turno.tdAsistencias = value;

        if (boton === 'darAsistenciaVisible')
            turno.darAsistenciaVisible = value;

        if (boton === 'sacarAsistenciaVisible')
            turno.sacarAsistenciaVisible = value;

        if (boton === 'disponibleVisible')
            turno.disponibleVisible = value;

        if (boton === 'suspenderTurnoVisible')
            turno.suspenderTurnoVisible = value;

        if (boton === 'suspenderTurnoDeshabilitadoVisible')
            turno.suspenderTurnoDeshabilitadoVisible = value;

        if (boton === 'liberarTurnoVisible')
            turno.liberarTurnoVisible = value;

        if (boton === 'liberarTurnoDeshabilitadoVisible')
            turno.liberarTurnoDeshabilitadoVisible = value;

        if (boton === 'bloquearTurnoVisible')
            turno.bloquearTurnoVisible = value;

        if (boton === 'bloquearTurnoDeshabilitadoVisible')
            turno.bloquearTurnoDeshabilitadoVisible = value;

        if (boton === 'reasignarTurnoVisible')
            turno.reasignarTurnoVisible = value;

        if (boton === 'reasignarTurnoDeshabilitadoVisible')
            turno.reasignarTurnoDeshabilitadoVisible = value;

        if (boton === 'smsVisible')
            turno.smsVisible = value;

        if (boton === 'smsNoEnviadoVisible')
            turno.smsNoEnviadoVisible = value;

        if (boton === 'smsEnviadoVisible')
            turno.smsEnviadoVisible = value;

        if (boton === 'smsLoaderVisible')
            turno.smsLoaderVisible = value;

        if (boton === 'verNotaVisible')
            turno.verNotaVisible = value;

        if (boton === 'txtNotaVisible')
            turno.txtNotaVisible = value;

        if (boton === 'btnGuardarNotaVisible')
            turno.btnGuardarNotaVisible = value;

        if (boton === 'verNota')
            turno.verNota = value;

        if (boton === 'listaEsperaVisible')
            turno.listaEsperaVisible = value;

        if (boton === 'chkVisible')
            turno.chkVisible = value;
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

    accionesTurnosVsible(turno: any) {
        // this.turnos.forEach(turno => {
        debugger;
        turno = {
            cualquiera: true
        };

        turno.nombrePacienteVisible = true;
        turno.estadoDisponibleVisible = true;
        turno.tdAsistencias = true;
        turno.darAsistenciaVisible = true;
        turno.sacarAsistenciaVisible = true;
        turno.disponibleVisible = true;
        turno.tdSuspenderTurno = true;
        turno.suspenderTurnoVisible = true;
        turno.suspenderTurnoDeshabilitadoVisible = true;
        turno.tdLiberarTurno = true;
        turno.liberarTurnoVisible = true;
        turno.liberarTurnoDeshabilitadoVisible = true;
        turno.tdBloquearTurno = true;
        turno.bloquearTurnoVisible = true;
        turno.bloquearTurno = true;
        turno.desbloquearTurno = true;
        turno.bloquearTurnoDeshabilitadoVisible = true;
        turno.tdReasignarTurno = true;
        turno.reasignarTurnoVisible = true;
        turno.reasignarTurnoDeshabilitadoVisible = true;
        turno.smsVisible = true;
        turno.smsNoEnviadoVisible = true;
        turno.smsEnviadoVisible = true;
        turno.smsLoaderVisible = true;
        turno.verNotaVisible = true;
        turno.txtNotaVisible = true;
        turno.btnGuardarNotaVisible = true;
        turno.verNota = true;
        turno.listaEsperaVisible = true;
        turno.chkVisible = true;
        // });
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

            this.confirmaLiberarTurno = false;

            this.accionesTurnosVsible(turno);

            this.liberarTurno(turno);

            this.pacientesSeleccionados.push(turno);
            this.enviarSMS();
        } else if ((btnClicked === 'darAsistencia') || (btnClicked === 'sacarAsistencia')) {

            patch = {
                'op': 'asistenciaTurno',
                'idTurno': turno.id
            };

            this.accionesTurnosVsible(turno);

            if (turno.asistencia)
                this.turnoAsignado(turno);
            else
                this.turnoConAsistencia(turno);

        } else if (btnClicked === 'bloquearTurno') {
            patch = {
                'op': 'bloquearTurno',
                'idTurno': turno.id
            };

            this.accionesTurnosVsible(turno);

            this.turnoDisponible(turno);

        } else if (this.confirmaSuspenderTurno) {
            patch = {
                'op': 'suspenderTurno',
                'idTurno': turno.id
            };

            this.confirmaSuspenderTurno = false;
        }

        this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {

            this.bloques = resultado.bloques;

            this.bloques.forEach(bloque => {
                debugger;
                bloque.turnos.forEach(turnos => {
                    debugger;
                    if (turno.id === turnos.id) {
                        turno.asistencia = turnos.asistencia;
                    }
                })
            });
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
        // this.smsLoader = true;

        for (let x = 0; x < this.pacientesSeleccionados.length; x++) {
            if (this.pacientesSeleccionados[x].paciente != null) {

                this.smsService.enviarSms(this.pacientesSeleccionados[x].paciente.telefono).subscribe(
                    resultado => {
                        this.resultado = resultado;
                        // this.smsLoader = false;
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


    /* Muestra Botonesss */

    turnoAsignado(turno: any) {
        turno.nombrePacienteVisible = false;
        turno.tdAsistencias = false;
        turno.darAsistenciaVisible = false;

        turno.tdSuspenderTurno = false;
        turno.suspenderTurnoVisible = false;
        turno.tdLiberarTurno = false;
        turno.liberarTurnoVisible = false;
        turno.tdBloquearTurno = false;
        turno.bloquearTurnoDeshabilitadoVisible = false;
        turno.tdReasignarTurno = false;
        turno.reasignarTurnoVisible = false;
        turno.verNota = false;

    }

    turnoDisponible(turno: any) {
        turno.darAsistencia = true;
        turno.sacarAsistencia = true;
        turno.estadoDisponibleVisible = false;
        turno.disponibleVisible = false;

        turno.tdSuspenderTurno = false;
        turno.suspenderTurnoDeshabilitadoVisible = false;
        turno.tdLiberarTurno = false;
        turno.liberarTurnoDeshabilitadoVisible = false;
        turno.tdBloquearTurno = false;
        turno.bloquearTurnoVisible = false;

        turno.tdReasignarTurno = false;
        turno.reasignarTurnoDeshabilitadoVisible = false;
        turno.verNota = false;

        debugger;
        if (turno.estado === 'disponible')
            this.desbloquearTurno(turno);
        else
            this.bloquearTurno(turno);
    }

    turnoConAsistencia(turno: any) {
        turno.nombrePacienteVisible = false;
        turno.tdAsistencias = false;
        turno.sacarAsistenciaVisible = false;
        turno.suspenderTurnoDeshabilitadoVisible = false;
        turno.liberarTurnoDeshabilitadoVisible = false;
        turno.bloquearTurnoDeshabilitadoVisible = false;
        turno.reasignarTurnoDeshabilitadoVisible = false;
        turno.verNota = false;
    }

    liberarTurno(turno: any) {
        turno.reasignarTurnoVisible = false;
        turno.listaEsperaVisible = false;
        turno.verNota = false;
    }

    bloquearTurno(turno: any) {
        debugger;

        if (turno.estado === 'bloqueado')
            turno.desbloquearTurno = false;
        else
            turno.bloquearTurno = false;
    }

    desbloquearTurno(turno: any) {
        if (turno.estado === 'bloqueado')
            turno.bloquearTurno = false;
        else
            turno.desbloquearTurno = false;

    }

    agregarNota(turno: any) {

        if (!turno.verNotaVisible) {
            this.accionesTurnosVsible(turno);

            if (turno.paciente) {
                this.turnoAsignado(turno);
            } else {
                this.turnoDisponible(turno);
            }
        } else {
            this.accionesTurnosVsible(turno);

            if (turno.paciente)
                turno.nombrePacienteVisible = false;
            else
                turno.estadoDisponibleVisible = false;

            turno.verNotaVisible = false;
            turno.txtNotaVisible = false;
            turno.btnGuardarNotaVisible = false;
        }

        turno.verNota = false;
    }

    constructor(public plex: Plex, public servicePaciente: PacienteService, public smsService: SmsService,
        public serviceAgenda: AgendaService, public listaEsperaService: ListaEsperaService) { }
}
