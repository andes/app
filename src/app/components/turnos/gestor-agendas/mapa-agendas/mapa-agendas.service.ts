import { Auth } from '@andes/auth';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ConceptosTurneablesService } from '../../../../services/conceptos-turneables.service';
import { AgendaService } from '../../../../services/turnos/agenda.service';

@Injectable({ providedIn: 'root' })
export class MapaAgendasService {
    public calendario$ = new BehaviorSubject<any[]>(null);
    conceptosTurneables;
    fecha;
    agendas;
    public calendario;
    tiposPrestacion = new Map();
    prestacionesPermisos;

    constructor(
        private agendaService: AgendaService,
        private conceptoTurneablesService: ConceptosTurneablesService,
        private auth: Auth
    ) { }

    public setPermisos(permisos: string) {
        this.prestacionesPermisos = this.auth.getPermissions(permisos);
    }

    public cargarAgendasMes(fecha) {
        this.fecha = fecha;
        let parametros = {
            fechaDesde: moment(this.fecha).startOf('month').toDate(),
            fechaHasta: moment(this.fecha).endOf('month').toDate(),
            organizacion: this.auth.organizacion.id
        };

        forkJoin([
            this.conceptoTurneablesService.getAll(),
            this.agendaService.get(parametros)]
        ).subscribe(([conceptosTurneables, agendas]) => {
            this.tipoPrestacionesColor(conceptosTurneables);
            this.agendas = agendas;
            this.cargarMes();
        });


    }

    private tipoPrestacionesColor(conceptosTurneables: any[]) {
        if (this.prestacionesPermisos[0] === '*') {
            this.conceptosTurneables = conceptosTurneables;
        } else {
            this.conceptosTurneables = conceptosTurneables.filter((x) => this.prestacionesPermisos.indexOf(x.id) >= 0);
        }
        this.conceptosTurneables.filter(d => d.color).forEach(tipoPrestacion => {
            this.tiposPrestacion.set(tipoPrestacion.conceptId, tipoPrestacion);
        });
    }


    private cargarMes() {
        this.calendario = [];
        let inicio = moment(this.fecha).startOf('month').startOf('week');
        let ultimoDiaMes = moment(this.fecha).endOf('month');
        let primerDiaMes = moment(this.fecha).startOf('month');
        let cantidadSemanas = Math.ceil(moment(this.fecha).endOf('month').endOf('week').diff(moment(this.fecha).startOf('month').startOf('week'), 'weeks', true));

        for (let r = 1; r <= cantidadSemanas; r++) {
            let week = [];
            this.calendario.push(week);

            for (let c = 1; c <= 7; c++) {
                let dia = inicio.toDate();
                let isThisMonth = inicio.isSameOrBefore(ultimoDiaMes) && inicio.isSameOrAfter(primerDiaMes);
                if (isThisMonth) {
                    week.push({
                        fecha: dia,
                        prestaciones: [],
                        totalPorPrestacion: []
                    });
                } else {
                    week.push({ estado: 'vacio' });
                }
                inicio.add(1, 'day');
            }

        }

        this.cargarTabla();
    }


    private cargarTabla() {
        this.calendario.forEach(semana => {
            semana.forEach(dia => {
                if (dia.estado !== 'vacio') {
                    let turnosAgenda = [];
                    this.agendas.forEach(agenda => {
                        let turnosAgendaBloques = [];
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
        let prestacion;
        prestacionesDia.forEach(prestacionDia => {
            prestacion = this.tiposPrestacion.get(prestacionDia.tipoPrestacion_id);
            if (prestacion) {
                prestacionDia['color'] = prestacion.color;
            }
        });

    }

    private ordenarInformacionCalendario(dia) {
        let prestacionesDelDia = dia.prestaciones;
        let prestacionesTipo;
        let totalesDiaPrestacion = [];
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

                    let cantidadTotalDiaPrestacion = {
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



