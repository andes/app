import { Component, HostBinding, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { HistorialTurnosService } from '../../../services/turnos/historial-turnos.service';

@Component({
    selector: 'historial-turnos',
    templateUrl: 'historial-turnos.component.html',
    styleUrls: ['historial-turnos.component.scss']
})

export class HistorialTurnosComponent implements OnInit {
    @Input() paciente: IPaciente;
    @Input() height = 580;
    @Input() @HostBinding('class.fill') fill = false;

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
            sorteable: false,
            sort: (a: any, b: any) => a.horaInicio.getTime() - b.horaInicio.getTime()
        },
        {
            key: 'prestacion',
            label: 'Prestación',
            sorteable: false,
            sort: (a: any, b: any) => a.tipoPrestacion.term.localeCompare(b.tipoPrestacion.term)
        },
        {
            key: 'profesional',
            label: 'Profesional',
            sorteable: false,
            sort: (a: any, b: any) => {
                const aProfesionales = a.profesionales?.map((p: any) => `${p.apellido} ${p.nombre}`).join(', ') || '';
                const bProfesionales = b.profesionales?.map((p: any) => `${p.apellido} ${p.nombre}`).join(', ') || '';
                return aProfesionales.localeCompare(bProfesionales);
            }

        },
        {
            key: 'obraSocial',
            label: 'Obra Social',
            sorteable: false,
            sort: (a: any, b: any) => {
                const aObraSocial = a.paciente.obraSocial?.nombre || a.paciente.obraSocial?.financiador || '';
                const bObraSocial = b.paciente.obraSocial?.nombre || b.paciente.obraSocial?.financiador || '';
                return aObraSocial.localeCompare(bObraSocial);
            }
        },
        {
            key: 'organizacion',
            label: 'Organización',
            sorteable: false,
            sort: (a: any, b: any) => a.organizacion.nombre.localeCompare(b.organizacion.nombre)
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: false,
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

    constructor(
        private historialTurnosService: HistorialTurnosService
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
}
