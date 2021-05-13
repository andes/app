import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Component, OnInit } from '@angular/core';
import { AgendaService } from 'src/app/services/turnos/agenda.service';
import { FechaPipe } from 'projects/shared/src/lib/pipes/fecha.pipe';
@Component({
    selector: 'mapa-agenda',
    templateUrl: 'mapa-agendas.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasComponent implements OnInit {

    public headers = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    public semana;
    public horaInicio = 6;
    public horaFin = 20;
    public horarios = [];
    public filasPorHorario;
    public colorPrestacion = '#00FFFF';
    public parametros;
    public intervalo = 30;
    public agendasDeLaSemana = [];
    constructor(

        private agendaService: AgendaService

    ) { }

    ngOnInit() {

        this.horarios = this.generarArregloHorarios();
        this.filasPorHorario = Array(2).fill(30).map((x, i) => i);
        this.semana = this.headers.map((dia, index) => {
            return {
                nombre: dia,
                fecha: moment().weekday(index).toDate(),
                horarios: this.generarArregloHorarios()

            };

        });

        this.cargarTabla();

    }




    private cargarTabla() {
        // solo busco las agendas de la semana en trasnscurso
        this.parametros = {
            fechaDesde: moment().startOf('week').toDate(),
            fechaHasta: moment().endOf('week').toDate(),
            organizacion: '',
            idTipoPrestacion: '',
            idProfesional: '',
            espacioFisico: '',
            otroEspacioFisico: '',
            estado: '',
            skip: 0,
            limit: 15
        };

        this.agendaService.get(this.parametros).subscribe((agendas: any) => {
            agendas.forEach(agenda => {
                this.agendasDeLaSemana.push(agenda);
            });
            this.semana.forEach((dia, index) => this.agendasDeLaSemana.filter(agenda => {
                if (moment(dia.fecha).isSame(agenda.horaInicio, 'day')) {
                    let turnos = agenda.bloques[0].turnos.filter(turno => turno.estado === 'asignado');
                    if (turnos) {
                        turnos.map(turno => dia.horarios.filter((hora, i) => {
                            this.filasPorHorario.map((n, aux) => {
                                let horaTurno = moment(turno.horaInicio);
                                let horaInicial = moment(dia.fecha).hour(hora.hora).minute(this.intervalo * aux);
                                let intervalo = moment(dia.fecha).hour(hora.hora).minute(this.intervalo * (aux + 1));
                                if (horaTurno.isBetween(horaInicial, intervalo, 'hours', '[)')) {
                                    this.semana[index].horarios[i].intervalo.push(turno);
                                }

                            });


                        }));
                    }

                }

            }));

        }, err => {
            if (err) {
            }
        });
    }

    private generarArregloHorarios() {
        let horarios = [];
        for (let index = 0; index < (this.horaFin - this.horaInicio); index++) {

            horarios.push({
                hora: this.horaInicio + index,
                intervalo: []
            });
        }
        return horarios;
    }
}
