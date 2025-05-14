import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { TurnoService } from '../../../services/turnos/turno.service';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { HistorialTurnosService } from '../../../services/turnos/historial-turnos.service';

@Component({
    selector: 'estadisticas-pacientes',
    templateUrl: 'estadisticas-pacientes.html',
    styleUrls: ['estadisticas-paciente.scss']
})

export class EstadisticasPacientesComponent implements OnInit {
    pacienteFields = ['sexo', 'edad', 'fechaNacimiento', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];
    historial$: Observable<any[]>;
    turnosPaciente$: Observable<any[]>;
    listadoTurnos$: Observable<any[]>;
    ultimosTurnos$: Observable<any[]>;
    public listadoActual: any[];
    public estadoTurno;
    public fechaDesde;
    public fechaHasta;
    public prestacion;
    public columns = [
        {
            key: 'fecha',
            label: 'Fecha',
            sorteable: true,
            sort: (a: any, b: any) => a.horaInicio.getTime() - b.horaInicio.getTime()
        },
        {
            key: 'prestacion',
            label: 'Prestación',
            sorteable: true,
            sort: (a: any, b: any) => a.tipoPrestacion.term.localeCompare(b.tipoPrestacion.term)
        },
        {
            key: 'profesional',
            label: 'Profesional',
            sorteable: true,
            sort: (a: any, b: any) => {
                const aProfesionales = a.profesionales?.map((p: any) => `${p.apellido} ${p.nombre}`).join(', ') || '';
                const bProfesionales = b.profesionales?.map((p: any) => `${p.apellido} ${p.nombre}`).join(', ') || '';
                return aProfesionales.localeCompare(bProfesionales);
            }

        },
        {
            key: 'obraSocial',
            label: 'Obra Social',
            sorteable: true,
            sort: (a: any, b: any) => {
                const aObraSocial = a.paciente.obraSocial?.nombre || a.paciente.obraSocial?.financiador || '';
                const bObraSocial = b.paciente.obraSocial?.nombre || b.paciente.obraSocial?.financiador || '';
                return aObraSocial.localeCompare(bObraSocial);
            }
        },
        {
            key: 'organizacion',
            label: 'Organización',
            sorteable: true,
            sort: (a: any, b: any) => a.organizacion.nombre.localeCompare(b.organizacion.nombre)
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: true,
            sort: (a: any, b: any) => {
                const aEstado = a.asistencia || a.estado;
                const bEstado = b.asistencia || b.estado;
                return aEstado.localeCompare(bEstado);
            }
        }
    ];

    estados = [
        {
            id: 1,
            nombre: 'Asignado',
        },
        {
            id: 2,
            nombre: 'Fuera de agenda',
        },
        {
            id: 3,
            nombre: 'Liberado',
        },
        {
            id: 4,
            nombre: 'Suspendido',
        }
    ];

    @Input() showTab: Number = 0;
    @Input() paciente: IPaciente;
    @Input() demandaInsatisfecha = false;
    @Output() demandaCerrada = new EventEmitter<any>();

    constructor(
        public serviceTurno: TurnoService,
        public auth: Auth,
        public serviceAgenda: AgendaService,
        private historialTurnosService: HistorialTurnosService,
    ) { }

    ngOnInit() {
        this.filtrar();
        this.refresh();
    }

    onScroll() {
        this.historialTurnosService.lastResults.next(this.listadoActual);
    }

    refresh() {
        this.ultimosTurnos$ = this.historialTurnosService.historialFiltrados$.pipe(
            map(resp => {
                resp = this.sortByHoraInicio(resp);
                resp = resp.filter(t => moment(t.horaInicio).isSameOrBefore(new Date(), 'day'));
                this.listadoActual = resp;
                return resp;
            })
        );
    }

    filtrar() {
        this.historialTurnosService.lastResults.next(null);
        this.historialTurnosService.paciente.next(this.paciente);
        this.historialTurnosService.fechaDesde.next(this.fechaDesde);
        this.historialTurnosService.fechaHasta.next(this.fechaHasta);
        this.historialTurnosService.estadoTurno.next(this.estadoTurno);
        this.historialTurnosService.prestacion.next(this.prestacion);
    }

    private sortByHoraInicio(turnos: any[]) {
        return turnos.sort((a, b) => {
            const inia = a.horaInicio ? new Date(a.horaInicio) : null;
            const inib = b.horaInicio ? new Date(b.horaInicio) : null;
            return ((inia && inib) ? (inib.getTime() - inia.getTime()) : 0);
        });
    }

    cerrarDemandaInsatisfecha() {
        this.demandaCerrada.emit();
    }

    motivoLiberado(turno) {
        return `Por ${turno.updatedBy.nombreCompleto} el ${moment(turno.updatedAt).format('DD/MM/YYYY')} a las ${moment(turno.updatedAt).format('HH:mm')}`;
    }
}
