import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Component, OnInit } from '@angular/core';
import { AgendaService } from 'src/app/services/turnos/agenda.service';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';

@Component({
    selector: 'mapa-agenda',
    templateUrl: 'mapa-agendas.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasComponent implements OnInit {

    public headers = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    public semana;
    public horaInicio = 6;
    public horaFin = 20;
    public horarios = [];
    public filasPorHorario;
    public parametros;
    public intervalo = 30;
    public diaInicio;
    public agendasDeLaSemana = [];
    public prestacionesPermisos;
    constructor(

        private agendaService: AgendaService,
        private auth: Auth,
        private conceptoTurneablesService: ConceptosTurneablesService

    ) { }

    ngOnInit() {
        this.prestacionesPermisos = this.auth.getPermissions('turnos:planificarAgenda:prestacion:?');

        this.turnosPorHora();
        this.cargarSemana();

    }

    private cargarSemana() {

        this.horarios = this.generarArregloHorarios();
        this.diaInicio = moment(this.diaInicio).startOf('week');
        this.filasPorHorario = this.turnosPorHora();
        this.semana = this.headers.map((dia, index) => {
            return {
                nombre: dia,
                fecha: this.diaInicio.weekday(index).toDate(),
                horarios: this.generarArregloHorarios()

            };

        });
        this.cargarTabla();
    }

    private cargarTabla() {

        this.parametros = {
            fechaDesde: moment(this.diaInicio).startOf('week').toDate(),
            fechaHasta: moment(this.diaInicio).endOf('week').toDate(),
            organizacion: '',
            idTipoPrestacion: '',
            idProfesional: '',
            espacioFisico: '',
            otroEspacioFisico: '',
            estado: ''
        };
        if (this.prestacionesPermisos.length > 0 && this.prestacionesPermisos[0] !== '*') {
            this.parametros['tipoPrestaciones'] = this.prestacionesPermisos;
        }
        this.conceptoTurneablesService.getAll().subscribe((data) => {
            let dataF;
            if (this.prestacionesPermisos[0] === '*') {
                dataF = data;
            } else {
                dataF = data.filter((x) => { return this.prestacionesPermisos.indexOf(x.id) >= 0; });
            }

            this.agendaService.get(this.parametros).subscribe((agendas: any) => {
                agendas.forEach(agenda => {

                    this.semana.forEach(dia => {

                        if (moment(dia.fecha).isSame(agenda.horaInicio, 'day')) {

                            let turnos = agenda.bloques[0].turnos.filter(turno => turno.estado === 'asignado');
                            turnos.forEach(t => dataF.forEach(tipoPrestacion => {

                                if (tipoPrestacion.color && t.tipoPrestacion.conceptId === tipoPrestacion.conceptId) {

                                    t.tipoPrestacion['color'] = tipoPrestacion.color;

                                }
                            }));

                            turnos.forEach(turno => dia.horarios.forEach(hora => {

                                hora.intervalos.forEach((intervalo, aux) => {

                                    let horaTurno = moment(turno.horaInicio);
                                    let horaInicial = moment(dia.fecha).hour(hora.hora).minute(this.intervalo * aux);
                                    let horaFin = moment(dia.fecha).hour(hora.hora).minute(this.intervalo * (aux + 1));

                                    if (horaTurno.isBetween(horaInicial, horaFin, null, '[)')) {

                                        intervalo.turnos.push(turno);

                                    }

                                });


                            }));


                        }

                    });
                });

            }, err => {
                if (err) {
                }
            });
        });

    }

    private generarArregloHorarios() {
        let horarios = [];
        for (let index = 0; index < (this.horaFin - this.horaInicio); index++) {

            horarios.push({
                hora: this.horaInicio + index,
                intervalos: this.turnosPorHora()
            });
        }
        return horarios;
    }


    private turnosPorHora() {
        let cantidadTurnosHora = 60 / this.intervalo;
        let horarioTurnos = [];
        for (let index = 0; index < cantidadTurnosHora; index++) {
            horarioTurnos.push({ turnos: [] });

        }
        return horarioTurnos;
    }
}
