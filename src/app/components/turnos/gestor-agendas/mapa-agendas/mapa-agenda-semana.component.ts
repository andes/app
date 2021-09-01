import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { MapaAgendasService } from './mapa-agendas.service';

@Component({
    selector: 'mapa-agenda-semana',
    templateUrl: 'mapa-agenda-semana.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasSemanaComponent implements OnInit, OnDestroy {

    public headers = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    public semana = [];
    public horaInicio = 6;
    public horaFin = 20;
    public horarios = [];
    public filasPorHorario;
    public intervalo = 30;
    public _fecha;
    public semanaSeleccionada;
    @Output() diaDetalle = new EventEmitter<any>();
    calendario: any;
    @Input('fecha')
    set fecha(value: any) {
        this._fecha = value;
        this.cambiarSemana();
    }
    private subscription: Subscription;


    constructor(
        private mapaAgendaService: MapaAgendasService
    ) { }

    ngOnInit() {
        this.subscription = this.mapaAgendaService.calendario$.subscribe(calendario => {
            this.calendario = calendario;
            this.cambiarSemana();
        });


    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private cargarSemana() {

        this.horarios = this.generarArregloHorarios();
        this._fecha = moment(this._fecha).startOf('week');
        this.filasPorHorario = this.turnosPorHora();
        this.semana = this.headers.map((dia, index) => {
            return {
                nombre: dia,
                fecha: this._fecha.weekday(index).toDate(),
                horarios: this.generarArregloHorarios()

            };

        });
        this.cargarTabla();
    }

    private cargarTabla() {

        this.semana.forEach(dia => {

            dia.horarios.forEach(hora => {
                hora.intervalos.forEach((intervalo, aux) => {
                    this.semanaSeleccionada?.forEach(diaSemana => {
                        if (moment(dia.fecha).isSame(diaSemana.fecha, 'day')) {

                            diaSemana.prestaciones?.forEach(prestacion => {

                                const turnos = [];

                                prestacion.turnosPorPrestacion.forEach(turno => {


                                    const horaTurno = moment(turno.horaInicio);
                                    const horaInicial = moment(dia.fecha).hour(hora.hora).minute(this.intervalo * aux);
                                    const horaFin = moment(dia.fecha).hour(hora.hora).minute(this.intervalo * (aux + 1));

                                    if (horaTurno.isBetween(horaInicial, horaFin, null, '[)')) {
                                        turnos.push(turno);
                                    }
                                });
                                if (turnos.length > 0) {
                                    intervalo.turnos.push({
                                        turnos: turnos,
                                        agenda: prestacion.agenda,
                                        color: prestacion.color
                                    });

                                }



                            });
                        }
                    });
                });
            });



        });


    }

    private cambiarSemana() {
        if (this.calendario) {
            this.semanaSeleccionada = this.calendario.find(dias =>
                dias.find(
                    dia => dia.fecha && moment(dia.fecha).isSame(this._fecha, 'day')
                )
            );
            if (this.semanaSeleccionada) {

                this.cargarSemana();

            } else {
                this.mapaAgendaService.cargarAgendasMes(this._fecha);

            }

        }

    }

    private generarArregloHorarios() {
        const horarios = [];
        for (let index = 0; index < (this.horaFin - this.horaInicio); index++) {

            horarios.push({
                hora: this.horaInicio + index,
                intervalos: this.turnosPorHora()
            });
        }
        return horarios;
    }


    private turnosPorHora() {
        const cantidadTurnosHora = 60 / this.intervalo;
        const horarioTurnos = [];
        for (let index = 0; index < cantidadTurnosHora; index++) {
            horarioTurnos.push({ turnos: [] });

        }
        return horarioTurnos;
    }


    detalleDia(turno) {

        this.diaDetalle.emit(turno);
    }


}
