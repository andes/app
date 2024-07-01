import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { EstadosAgenda } from './../../enums';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { environment } from './../../../../../environments/environment';
import * as moment from 'moment';
import { SmsService } from './../../../../services/turnos/sms.service';
import { TurnoService } from './../../../../services/turnos/turno.service';
import { Auth } from '@andes/auth';
import { forkJoin } from 'rxjs';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';

@Component({
    selector: 'suspender-agenda',
    templateUrl: 'suspender-agenda.html'
})

export class SuspenderAgendaComponent implements OnInit {
    resultado: String;
    seleccionadosSMS = [];
    todosSeleccionados = false;

    @Input() agenda: IAgenda;
    @Output() returnSuspenderAgenda = new EventEmitter<any>();
    @Output() cerrarSidebar = new EventEmitter<any>();


    constructor(public plex: Plex, public auth: Auth, public serviceAgenda: AgendaService, public smsService: SmsService, public turnosService: TurnoService, public pacienteService: PacienteService) { }

    public mostrarHeaderCompleto = false; // Pongo false por defecto, estipo que arranca así. [Agregado para AOT]
    public motivoSuspensionSelect = { select: null };
    public motivoSuspension: { id: number; nombre: string }[];
    public estadosAgenda = EstadosAgenda;
    public ag;
    public showData = false;
    public showConfirmar = false;
    public telefonos = [];
    /**
     * Array con todos los turnos de la agenda.
     *
     * @memberof SuspenderAgendaComponent
     */
    public turnos = [];
    ngOnInit() {
        this.motivoSuspension = [
            {
                id: 1,
                nombre: 'edilicia'
            },
            {
                id: 2,
                nombre: 'profesional'
            },
            {
                id: 3,
                nombre: 'organizacion'
            }];
        this.motivoSuspensionSelect.select = this.motivoSuspension[1];
        if (this.agenda.estado === 'suspendida') {
            let sinTelefono = [];
            this.agenda.bloques.forEach(bloque => {
                const sinTel = bloque.turnos.filter(turno => turno.paciente && (!turno.paciente.telefono || (turno.paciente.telefono && turno.paciente.telefono === '')));
                sinTelefono = sinTelefono.concat(sinTel);
            });

            const sinTel = this.agenda.sobreturnos.filter(sobreTurno => sobreTurno.paciente && (sobreTurno.paciente.telefono === null || !sobreTurno.paciente.telefono?.length));
            sinTelefono = sinTelefono.concat(sinTel);

            if (sinTelefono.length) {
                const request = sinTelefono.map(turno => this.pacienteService.getById(turno.paciente.id));
                forkJoin(request).subscribe(response => {
                    response.forEach(paciente => {
                        const telefono = paciente.contacto.find(contacto => contacto.tipo !== 'email');
                        if (telefono && telefono.valor && telefono.valor !== '') {
                            const pacientesEncontrado = sinTelefono.filter(turno => turno.paciente.id === paciente.id);
                            pacientesEncontrado.map(pac => {
                                const telefonos = (paciente.contacto.filter(numero => numero.tipo !== 'email'));
                                this.telefonos.push(telefonos);
                                pac.paciente.telefono = '';
                                telefonos.forEach(tel => pac.paciente.telefono = `${pac.paciente.telefono} ${tel.valor} ( ${tel.tipo} ) - `);
                                pac.paciente.telefono = pac.paciente.telefono.slice(0, -2);
                                const email = paciente.contacto.find(contacto => contacto.tipo === 'email');
                                if (email?.valor) {
                                    pac.paciente.email = email.valor;
                                }
                                pac.paciente.apellido = paciente.apellido;
                                pac.paciente.nombre = paciente.nombre;
                                pac.paciente.documento = paciente.documento;
                                pac.paciente.fechaNacimiento = paciente.fechaNacimiento;
                                pac.paciente.sexo = paciente.sexo;
                            });
                        }
                    });
                });
            }
        }
        (this.agenda.estado !== 'suspendida') ? this.showConfirmar = true : this.showData = true;
        this.agenda.bloques.forEach(bloque => {
            bloque.turnos.forEach(turno => {
                if (turno.paciente && turno.paciente.id && turno.paciente.telefono) {
                    this.turnos.push(turno);
                }
            });
        });
        this.agenda.sobreturnos.forEach(sobreturno => {

            if (sobreturno.paciente && sobreturno.paciente.id && sobreturno.paciente.telefono) {
                this.turnos.push(sobreturno);
            }
        });
    }

    suspenderAgenda() {
        this.showConfirmar = false;
        this.showData = true;
        if (this.motivoSuspensionSelect.select.nombre === null) {
            return;
        }

        const patch = {
            'op': 'suspendida',
            'estado': 'suspendida',
            'motivo': this.motivoSuspensionSelect.select.nombre
        };

        this.serviceAgenda.patch(this.agenda.id, patch).subscribe((resultado: any) => {
            // Si son múltiples, esperar a que todas se actualicen
            this.agenda.estado = resultado.estado;
            this.plex.toast('success', 'Información', 'La agenda cambió el estado a Suspendida');
            this.returnSuspenderAgenda.emit(this.agenda);
        }, err => {
            if (err) {
                this.plex.info('warning', 'Otro usuario ha modificado el estado de la agenda seleccionada, su gestor se ha actualizado', err);
                this.cancelar();
            }
        });
    }

    cancelar() {
        this.showConfirmar = false;
        this.showData = false;
        this.returnSuspenderAgenda.emit(null);
    }


    notificar() {
        // Se envían SMS sólo en Producción
        if (environment.production === true) {
            for (let x = 0; x < this.seleccionadosSMS.length; x++) {
                if (this.seleccionadosSMS[x].avisoSuspension !== 'enviado') {
                    const dia = moment(this.seleccionadosSMS[x].horaInicio).format('DD/MM/YYYY');
                    const horario = moment(this.seleccionadosSMS[x].horaInicio).format('HH:mm');
                    const mensaje = 'Le informamos que su turno del dia ' + dia + ' a las ' + horario + ' horas fue SUSPENDIDO.   ' + this.auth.organizacion.nombre;
                    this.seleccionadosSMS[x].smsEnviado = 'pendiente';
                    this.seleccionadosSMS[x].smsEnviado = this.send(this.seleccionadosSMS[x], mensaje);
                }
            }
        } else {
            this.plex.toast('info', 'INFO: SMS no enviado (activo sólo en Producción)');
        }

    }

    send(turno: any, mensaje) {
        if (!turno.paciente || !turno.paciente.telefono) {
            return;
        }
        const smsParams = {
            telefono: turno.paciente.telefono,
            mensaje: mensaje,
        };
        let idBloque;
        this.agenda.bloques.forEach(element => {
            const indice = element.turnos.findIndex(t => {
                return (t.id === turno.id);
            });
            idBloque = (indice !== -1) ? element.id : -1;
        });
        this.smsService.enviarSms(smsParams).subscribe(
            sms => {
                if (sms === '0') {
                    this.plex.toast('info', 'Se envió SMS al paciente ' + (turno.paciente.alias || turno.paciente.nombre) + ' ' + turno.paciente.apellido);
                    const data = {
                        avisoSuspension: 'enviado'
                    };
                    this.turnosService.patch(this.agenda.id, idBloque, turno.id, data).subscribe(resultado => {
                        turno.avisoSuspension = 'enviado';
                    });
                }
            },
            err => {
                if (err) {
                    this.plex.toast('danger', 'ERROR: Servicio caído');
                    const data = {
                        idAgenda: this.agenda.id,
                        idBloque: idBloque,
                        idTurno: turno.id,
                        avisoSuspension: 'fallido'
                    };
                    this.turnosService.patch(this.agenda.id, idBloque, turno.id, data).subscribe(resultado => {
                        turno.avisoSuspension = 'fallido';
                    });
                }
            });
    }

    seleccionarTurno(turno) {
        const indice = this.seleccionadosSMS.indexOf(turno);
        this.todosSeleccionados = false;
        if (indice === -1) {
            if (!(turno.reasignado && turno.reasignado.siguiente)) {
                if (turno.paciente && turno.paciente.id && turno.paciente.telefono && turno.paciente.telefono !== '') {
                    this.seleccionadosSMS = [...this.seleccionadosSMS, turno];
                }
            }
        } else {
            this.seleccionadosSMS.splice(indice, 1);
            this.seleccionadosSMS = [...this.seleccionadosSMS];
        }
    }
    // para setear el checkbox de seleccion de c/ turno
    estaSeleccionado(turno) {
        if (this.seleccionadosSMS.indexOf(turno) >= 0) {
            return true;
        } else {
            return false;
        }
    }

    seleccionarTodos() {
        if (this.seleccionadosSMS.length < this.turnos.length) {
            this.seleccionadosSMS = [];
            this.agenda.bloques.forEach(bloque => {
                bloque.turnos.forEach(turno => {
                    if (!(turno.reasignado && turno.reasignado.siguiente)) {
                        if (turno.paciente && turno.paciente.telefono && turno.paciente.telefono !== '') {
                            this.seleccionadosSMS = [...this.seleccionadosSMS, turno];
                        }
                    }
                });
            });
            this.agenda.sobreturnos.forEach(sobreturno => {
                if (!(sobreturno.reasignado && sobreturno.reasignado.siguiente)) {
                    if (sobreturno.paciente && sobreturno.paciente.telefono && sobreturno.paciente.telefono !== '') {
                        this.seleccionadosSMS = [...this.seleccionadosSMS, sobreturno];
                    }
                }
            });
            this.todosSeleccionados = true;
        } else {
            this.seleccionadosSMS = [];
            this.todosSeleccionados = false;
        }
    }

    tienePaciente(turno) {
        return turno.paciente != null && turno.paciente.id != null;
    }
    cerrarSidebarTurnos() {
        this.cerrarSidebar.emit();
    }
}
