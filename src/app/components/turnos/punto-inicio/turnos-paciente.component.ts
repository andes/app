import { Component, Input, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { FacturacionAutomaticaService } from './../../../services/facturacionAutomatica.service';
import { DocumentosService } from '../../../services/documentos.service';
import * as moment from 'moment';

// Servicios
import { TurnoService } from '../../../services/turnos/turno.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { ObraSocialService } from '../../../services/obraSocial.service';

import { IAgenda } from '../../../interfaces/turnos/IAgenda';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
@Component({
    selector: 'turnos-paciente',
    templateUrl: 'turnos-paciente.html',
    styleUrls: ['turnos-paciente.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})

export class TurnosPacienteComponent implements OnInit {
    cambioMotivo: boolean;
    turnoArancelamiento: any;
    showMotivoConsulta = false;
    ultimosTurnos: any[];
    puedeRegistrarAsistencia: boolean;
    puedeLiberarTurno: boolean;
    agenda: IAgenda;
    showLiberarTurno: boolean;
    todaysdate: Date;
    obraSocialSeleccionada: String;
    _turnos: any;
    _obraSocial: any;
    _operacion: string;
    tituloOperacion = 'Operaciones de Turnos';
    turnosPaciente: any;
    turnosSeleccionados: any[] = [];
    showPuntoInicio = true;
    showListaPrepagas: Boolean = false;
    public obraSocialPaciente: any[] = [];
    public prepagas: any[] = [];
    public _paciente: IPaciente;
    @Input('operacion')
    set operacion(value: string) {
        this._operacion = value;
    }

    get operacion(): string {
        return this._operacion;
    }
    @Input('paciente')
    set paciente(value: any) {
        this._paciente = value;
    }
    get paciente(): any {
        return this._paciente;
    }

    @Input('turnos')
    set turnos(value: any) {
        if (value) {
            this._turnos = value;
            this.turnosPaciente = value;
            this.turnosPaciente.obraSocial = ((this._paciente.financiador) && (this._paciente.financiador.length > 0) && (this._paciente.financiador[0])) ? this._paciente.financiador[0].nombre : null;
        }
    }
    get turnos(): any {
        return this._turnos;
    }
    @Output() turnosPacienteChanged = new EventEmitter<any>();

    public modelo: any = {
        obraSocial: ''
    };

    // Inicialización
    constructor(public servicioFA: FacturacionAutomaticaService, public obraSocialService: ObraSocialService, public documentosService: DocumentosService,
                public serviceTurno: TurnoService, public serviceAgenda: AgendaService, public plex: Plex, public auth: Auth) { }

    ngOnInit() {
        this.puedeRegistrarAsistencia = this.auth.check('turnos:turnos:registrarAsistencia');
        this.puedeLiberarTurno = this.auth.check('turnos:turnos:liberarTurno');
        this.todaysdate = new Date();
        this.todaysdate.setHours(0, 0, 0, 0);
        this.loadObraSocial();
        this.obraSocialService.getPrepagas().subscribe(prepagas => {
            this.prepagas = prepagas;
        });
    }
    loadObraSocial() {
        // TODO: si es en colegio médico hay que buscar en el paciente
        if (!this._paciente) {
            return;
        } else {
            this._obraSocial = this._paciente.financiador || [];
        }
        if (this._obraSocial.length) {
            this.obraSocialPaciente = this._obraSocial.map((os: any) => {
                let osPaciente;

                if (os.nombre) {
                    osPaciente = {
                        'id': os.nombre,
                        'label': os.nombre
                    };
                } else {
                    osPaciente = {
                        'id': os.financiador,
                        'label': os.financiador
                    };
                }
                return osPaciente;
            });
            this.modelo.obraSocial = this.obraSocialPaciente[0].label;
        }
        this.obraSocialPaciente.push({ 'id': 'prepaga', 'label': 'Prepaga' });
    }

    cambiarMotivo() {
        this.cambioMotivo = true;
    }

    showPanel() {
        this.showMotivoConsulta = false;
        this.showLiberarTurno = false;
    }

    showArancelamiento(turno) {
        if (turno.obraSocial === 'prepaga' && !turno.prepaga) {
            this.plex.toast('danger', 'Seleccione una Prepaga', '¡Atención!');
            return;
        }
        if (turno.obraSocial === 'prepaga' || turno.prepaga) {
            this.obraSocialSeleccionada = turno.prepaga.nombre;
        } else {
            this.obraSocialSeleccionada = turno.obraSocial || (turno.paciente.obraSocial && turno.paciente.obraSocial.nombre);
        }

        if (!this.obraSocialSeleccionada) {
            this.plex.toast('danger', 'Seleccione una obra social o prepaga', '¡Atención!');
            return;
        }
        this.turnoArancelamiento = turno;
        this.showMotivoConsulta = true;
    }

    async printArancelamiento(turno) {
        const data = {};
        if (this.cambioMotivo) {
            data['motivoConsulta'] = turno.motivoConsulta;
        }

        const obraSocialUpdate = this._obraSocial.find(os => os.nombre === this.obraSocialSeleccionada);
        turno.paciente.obraSocial = (obraSocialUpdate) ? obraSocialUpdate : {
            codigoPuco: null,
            nombre: this.obraSocialSeleccionada,
            financiador: this.obraSocialSeleccionada
        };

        data['actualizaObraSocial'] = turno.paciente.obraSocial;
        data['turno'] = turno;
        const bloqueId = (turno.bloque_id) ? turno.bloque_id : -1;

        this.serviceTurno.patch(turno.agenda_id, bloqueId, turno.id, data).subscribe(() => {
            this.documentosService.descargarArancelamiento({ turnoId: turno.id }, 'recupero').subscribe();
        });
    }

    eventosTurno(turno, operacion) {
        let mensaje = '';
        let tipoToast = 'info';
        const patch: any = {
            op: operacion,
            turnos: [turno._id],
        };

        // Patchea los turnosSeleccionados (1 o más turnos)
        this.serviceAgenda.patch(turno.agenda_id, patch).subscribe(resultado => {
            this.turnosPacienteChanged.emit();
            switch (operacion) {
                case 'darAsistencia':
                    mensaje = 'Se registro la asistencia del paciente';
                    tipoToast = 'success';
                    break;
                case 'sacarAsistencia':
                    mensaje = 'Se registro la inasistencia del paciente';
                    tipoToast = 'warning';
                    break;
            }
            if (mensaje !== '') {
                this.plex.toast(tipoToast, mensaje);
            }
        });
        // });

    }

    liberarTurno(turno) {
        this.turnosSeleccionados = [turno];
        this.serviceAgenda.getById(turno.agenda_id).subscribe(resultado => {
            this.agenda = resultado; // obtiene la agenda para enviarla al componente liberar-turno
            this.showLiberarTurno = true;
        });
    }

    afterLiberarTurno() {
        this.showLiberarTurno = false;
        this.turnosPacienteChanged.emit();
    }

    isToday(turno) {
        return (moment(turno.horaInicio)).isSame(new Date(), 'day');
    }

    seleccionarObraSocial(event, elem) {
        if (event.value === 'prepaga') {
            this.obraSocialService.getPrepagas().subscribe(prepagas => {
                elem.showListaPrepagas = true;
                this.prepagas = prepagas;
            });
        } else {
            elem.showListaPrepagas = false;
        }
        elem.obraSocial = event && event.value;
    }
}

