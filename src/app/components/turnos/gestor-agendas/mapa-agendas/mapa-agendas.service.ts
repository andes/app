import { Auth } from '@andes/auth';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ITipoPrestacion } from 'src/app/interfaces/ITipoPrestacion';
import { ConceptosTurneablesService } from '../../../../services/conceptos-turneables.service';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { NotaAgendaService } from './nota-agenda.service';

@Injectable({ providedIn: 'root' })
export class MapaAgendasService {
    public calendario$ = new BehaviorSubject<any[]>(null);
    conceptosTurneables;
    fecha;
    agendas;
    public calendario;
    tiposPrestacion = new Map<string, ITipoPrestacion>();
    prestacionesPermisos;
    servicioIntermedio;
    requiereServicioIntermedio = false;
    modoRup = false;
    notas = [];

    constructor(
        private agendaService: AgendaService,
        private conceptoTurneablesService: ConceptosTurneablesService,
        private notaAgendaService: NotaAgendaService,
        private auth: Auth
    ) { }

    public setPermisos(permisos: string) {
        this.modoRup = permisos.startsWith('rup:');
        this.prestacionesPermisos = this.auth.getPermissions(permisos);
    }

    public setServicioIntermedio(servicio) {
        this.servicioIntermedio = servicio || null;
    }

    public setRequiereServicioIntermedio(requiere: boolean) {
        this.requiereServicioIntermedio = requiere;
    }

    public cargarAgendasMes(fecha) {
        if (this.requiereServicioIntermedio && !this.servicioIntermedio?.id) {
            return;
        }
        this.fecha = fecha;
        const parametros: any = {
            fechaDesde: moment(this.fecha).startOf('month').toDate(),
            fechaHasta: moment(this.fecha).endOf('month').toDate(),
            organizacion: this.auth.organizacion.id
        };
        if (this.servicioIntermedio?.id) {
            parametros.servicioIntermedio = this.servicioIntermedio.id;
        }

        const notas$ = this.modoRup
            ? this.notaAgendaService.search(this.parametrosNotas()).pipe(catchError(() => of([])))
            : of([]);

        forkJoin([
            this.conceptoTurneablesService.getAll(),
            this.agendaService.get(parametros),
            notas$
        ]).subscribe(([conceptosTurneables, agendas, notas]) => {
            this.tipoPrestacionesColor(conceptosTurneables);
            this.agendas = agendas;
            this.notas = notas || [];
            this.cargarMes();
        });


    }

    private parametrosNotas() {
        const desde = moment(this.fecha).startOf('month').format('YYYY-MM-DD');
        const hasta = moment(this.fecha).endOf('month').format('YYYY-MM-DD');
        const params: any = {
            fecha: `${desde}|${hasta}`
        };
        if (this.servicioIntermedio?.id) {
            params.servicioIntermedio = this.servicioIntermedio.id;
        }
        return params;
    }

    private tipoPrestacionesColor(conceptosTurneables: ITipoPrestacion[]) {
        this.tiposPrestacion.clear();
        const conceptosServicio = this.servicioIntermedio?.tipoPrestacion || [];
        if (this.servicioIntermedio) {
            const conceptIds = conceptosServicio.map(tipo => tipo.conceptId);
            this.conceptosTurneables = conceptosTurneables.filter(x => conceptIds.indexOf(x.conceptId) >= 0);
        } else if (this.prestacionesPermisos && this.prestacionesPermisos[0] === '*') {
            this.conceptosTurneables = conceptosTurneables;
        } else {
            this.conceptosTurneables = conceptosTurneables.filter((x) => this.prestacionesPermisos?.indexOf(x.id) >= 0);
        }
        this.conceptosTurneables.filter(d => d.color).forEach(tipoPrestacion => {
            this.tiposPrestacion.set(tipoPrestacion.conceptId, tipoPrestacion);
        });
    }


    private cargarMes() {
        this.calendario = [];
        const inicio = moment(this.fecha).startOf('month').startOf('week');
        const ultimoDiaMes = moment(this.fecha).endOf('month');
        const primerDiaMes = moment(this.fecha).startOf('month');
        const cantidadSemanas = Math.ceil(moment(this.fecha).endOf('month').endOf('week').diff(moment(this.fecha).startOf('month').startOf('week'), 'weeks', true));

        for (let r = 1; r <= cantidadSemanas; r++) {
            const week = [];
            this.calendario.push(week);

            for (let c = 1; c <= 7; c++) {
                const dia = inicio.toDate();
                const isThisMonth = inicio.isSameOrBefore(ultimoDiaMes) && inicio.isSameOrAfter(primerDiaMes);
                if (isThisMonth) {
                    week.push({
                        fecha: dia,
                        prestaciones: [],
                        totalPorPrestacion: [],
                        notas: this.notasDelDia(dia)
                    });
                } else {
                    week.push({ estado: 'vacio' });
                }
                inicio.add(1, 'day');
            }

        }

        this.cargarTabla();
    }

    private notasDelDia(fecha) {
        return (this.notas || []).filter(nota =>
            moment(nota.fecha).isSame(fecha, 'day') || moment(nota.horaInicio).isSame(fecha, 'day')
        );
    }


    private cargarTabla() {
        this.calendario.forEach(semana => {
            semana.forEach(dia => {
                if (dia.estado !== 'vacio') {
                    let turnosAgenda = [];
                    this.agendas.forEach(agenda => {
                        const turnosAgendaBloques = [];
                        let disponible = 0;
                        if (moment(dia.fecha).isSame(agenda.horaInicio, 'day')) {
                            agenda.bloques?.forEach((bloque) => {
                                const asignado = bloque.turnos.filter(turno => turno.estado === 'asignado');
                                disponible = disponible + bloque.turnos.filter(turno => turno.estado === 'disponible').length;

                                asignado.forEach(turnoBloque => {
                                    turnosAgendaBloques.push(turnoBloque);
                                });
                            });
                            turnosAgenda = [...agenda.sobreturnos, ...turnosAgendaBloques];
                            this.ordenarPrestacionesAgendas(dia, turnosAgenda, agenda, disponible);
                        }

                    });
                    this.getColor(dia.prestaciones);
                    dia.prestaciones = dia.prestaciones.filter(p => p.color);
                    this.ordenarInformacionCalendario(dia);
                }

            });

        });
        this.calendario$.next(this.calendario);
    }


    private getColor(prestacionesDia) {
        prestacionesDia.forEach(prestacionDia => {
            const prestacion = this.tiposPrestacion.get(prestacionDia.tipoPrestacion_id);
            if (prestacion) {
                prestacionDia['color'] = prestacion.color;
            }
        });

    }

    private ordenarInformacionCalendario(dia) {
        const prestacionesDelDia = dia.prestaciones;
        let prestacionesTipo;
        const totalesDiaPrestacion = [];
        if (prestacionesDelDia.length > 0) {

            this.tiposPrestacion.forEach(prestacion => {
                let asignado = 0;
                let disponible = 0;
                prestacionesTipo = prestacionesDelDia.filter(p => prestacion.conceptId === p.tipoPrestacion_id);
                if (prestacionesTipo.length > 0) {
                    prestacionesTipo.forEach(prestaciontipo => {
                        asignado = asignado + prestaciontipo.turnosPorPrestacion.length;
                        disponible = disponible + prestaciontipo.disponible;
                    });

                    const cantidadTotalDiaPrestacion = {
                        nombrePrestacion: prestacionesTipo[0].nombre,
                        asignado: asignado,
                        disponible: disponible,
                        color: prestacion.color,
                        id_tipo_prestacion: prestacionesTipo[0].tipoPrestacion_id,
                        porcentajeAsignado: asignado * 100 / (asignado + disponible),
                        porcentajeDisponible: disponible * 100 / (asignado + disponible)
                    };

                    totalesDiaPrestacion.push(cantidadTotalDiaPrestacion);

                }
                dia.totalPorPrestacion = totalesDiaPrestacion;


            });

        }


    }


    private ordenarPrestacionesAgendas(dia, turnosAgenda, agenda, disponible) {
        const turnosPrestacion = {};
        const aux = [];
        if (turnosAgenda.length === 0 && disponible > 0) {
            const turnoPrestacion = {
                turnosPorPrestacion: [],
                tipoPrestacion_id: agenda.tipoPrestaciones[0].conceptId,
                nombre: agenda.tipoPrestaciones[0].term,
                agenda: agenda,
                disponible: disponible

            };
            dia.prestaciones.push(turnoPrestacion);
        }


        turnosAgenda.forEach(turno => {

            if (!turnosPrestacion[turno.tipoPrestacion.conceptId]) {
                turnosPrestacion[turno.tipoPrestacion.conceptId] = {
                    turnosPorPrestacion: [],
                    tipoPrestacion_id: turno.tipoPrestacion.conceptId,
                    nombre: turno.tipoPrestacion.term,
                    agenda: agenda,
                    disponible: 0
                };
            }

            turnosPrestacion[turno.tipoPrestacion.conceptId].turnosPorPrestacion.push(turno);
        });


        for (const property in turnosPrestacion) {

            aux.push(turnosPrestacion[property]);

        }
        if (aux.length > 0) {
            aux[0].disponible = disponible;
            aux.forEach(a => dia.prestaciones.push(a));

        }

    }

}



