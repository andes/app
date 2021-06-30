import { Auth } from '@andes/auth';
import { Injectable } from '@angular/core';
import { ConceptosTurneablesService } from '../conceptos-turneables.service';
import { AgendaService } from './agenda.service';
import { BehaviorSubject } from 'rxjs';

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
            fechaHasta: moment(this.fecha).endOf('month').toDate()
        };

        this.prestacionesPermisos = this.auth.getPermissions('turnos:planificarAgenda:prestacion:?');

        this.conceptoTurneablesService.getAll().subscribe((data) => {
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
        });

        this.agendaService.get(parametros).subscribe(agendas => {
            this.agendas = agendas;
            this.cargarMes();
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
                        agendas: []
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
                    let turnosDia = [];
                    this.agendas.forEach(agenda => {


                        if (moment(dia.fecha).isSame(agenda.horaInicio, 'day')) {
                            agenda.bloques?.forEach((bloque, indiceBloque) => {
                                let color;
                                const asignado = bloque.turnos.filter(turno => turno.estado === 'asignado');
                                const disponible = bloque.turnos.filter(turno => turno.estado === 'disponible');
                                this.tiposPrestacion.forEach(tipoPrestacion => {

                                    if (bloque.tipoPrestaciones[0].conceptId === tipoPrestacion.conceptId) {

                                        color = tipoPrestacion.color;

                                    }
                                });
                                if ((asignado.length > 0 || disponible.length > 0) && color) {

                                    turnosDia.push({
                                        agenda: agenda,
                                        tipoPrestacion: bloque.tipoPrestaciones[0],
                                        asignados: asignado,
                                        disponible: indiceBloque === 0 ? disponible : [],
                                        color: color
                                    });
                                }

                            });

                        }

                    });

                    if (turnosDia?.length > 0) {



                        let turnosPrestacion = {};
                        turnosDia.forEach(x => {

                            if (!turnosPrestacion.hasOwnProperty(x.tipoPrestacion.conceptId)) {
                                turnosPrestacion[x.tipoPrestacion.conceptId] = {
                                    agendasPorPrestacion: [],
                                    tipoPrestacion: x.tipoPrestacion.term,
                                    color: x.color
                                };
                            }

                            turnosPrestacion[x.tipoPrestacion.conceptId].agendasPorPrestacion.push(x);

                        });


                        for (const property in turnosPrestacion) {

                            dia.agendas.push(turnosPrestacion[property]);
                        }



                        if (dia.agendas.length > 0) {
                            dia.agendas.forEach(agendas => {

                                let asignado = [];
                                let disponible = [];
                                agendas.agendasPorPrestacion.forEach(agendaPrestacion => {
                                    agendaPrestacion.asignados.forEach(turnoAsigado => asignado.push(turnoAsigado));
                                    agendaPrestacion.disponible.forEach(turnoDisponible => disponible.push(turnoDisponible));

                                });
                                agendas['informacion'] = {
                                    asignado: asignado,
                                    disponible: disponible,
                                    porcentajeAsignado: asignado.length * 100 / (asignado.length + disponible.length),
                                    porcentajeDisponible: disponible.length * 100 / (asignado.length + disponible.length)
                                };
                            });

                        }

                    }
                }
            });
        });
        this.calendario$.next(this.calendario);

    }


}
