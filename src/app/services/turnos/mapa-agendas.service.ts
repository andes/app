import { Auth } from '@andes/auth';
import { Injectable } from '@angular/core';
import { ConceptosTurneablesService } from '../conceptos-turneables.service';
import { AgendaService } from './agenda.service';
import { BehaviorSubject, forkJoin } from 'rxjs';

@Injectable()
export class MapaAgendasService {
    public calendario$ = new BehaviorSubject<any[]>(null);
    conceptosTurneables;
    fecha;
    agendas;
    public calendario;
    tiposPrestacion;
    prestacionesPermisos;

    constructor(private agendaService: AgendaService,
        private conceptoTurneablesService: ConceptosTurneablesService,
        private auth: Auth) { }



    public cargarAgendasMes(fecha) {
        this.fecha = fecha;
        let parametros = {
            fechaDesde: moment(this.fecha).startOf('month').toDate(),
            fechaHasta: moment(this.fecha).endOf('month').toDate(),
            organizacion: this.auth.organizacion.id
        };

        this.prestacionesPermisos = this.auth.getPermissions('rup:tipoPrestacion:?');

        forkJoin([this.conceptoTurneablesService.getAll(), this.agendaService.get(parametros)]).subscribe(
            ([data, agendas]) => {
                this.tipoPrestacionesColor(data);
                this.agendas = agendas;
                this.cargarMes();
            }
        );


    }

    private tipoPrestacionesColor(data) {
        if (this.prestacionesPermisos[0] === '*') {
            this.conceptosTurneables = data;
        } else {
            this.conceptosTurneables = data.filter((x) => { return this.prestacionesPermisos.indexOf(x.id) >= 0; });
        }

        let tiposPrestacion = this.conceptosTurneables.filter(d => d.color);
        let setTiposPrestaciones = new Map();
        tiposPrestacion.forEach(tipoPrestacion => {
            setTiposPrestaciones.set(tipoPrestacion.conceptId, tipoPrestacion);
        });
        this.tiposPrestacion = [...setTiposPrestaciones.values()];
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


                            let turnosPrestacion = {};
                            turnosAgenda.forEach(x => {

                                if (!turnosPrestacion[x.tipoPrestacion.conceptId]) {
                                    turnosPrestacion[x.tipoPrestacion.conceptId] = {
                                        turnosPorPrestacion: [],
                                        tipoPrestacion_id: x.tipoPrestacion.conceptId,
                                        nombre: x.tipoPrestacion.term,
                                        agenda: agenda,
                                        disponible: disponible
                                    };
                                }

                                turnosPrestacion[x.tipoPrestacion.conceptId].turnosPorPrestacion.push(x);

                            });

                            for (const property in turnosPrestacion) {

                                dia.prestaciones.push(turnosPrestacion[property]);
                            }

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

            prestacion = this.tiposPrestacion.find(tipoPrestacion => tipoPrestacion.conceptId === prestacionDia.tipoPrestacion_id);
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

}



