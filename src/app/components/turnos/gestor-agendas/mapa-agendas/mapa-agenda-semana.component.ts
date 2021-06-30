import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MapaAgendasService } from 'src/app/services/turnos/mapa-agendas.service';


@Component({
    selector: 'mapa-agenda-semana',
    templateUrl: 'mapa-agenda-semana.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasSemanaComponent implements OnInit {

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
    @Input() calendario: any;
    @Input('fecha')
    set fecha(value: any) {
        this._fecha = value;
        this.cabiarSemana();
    }

    constructor(
        private mapaAgendaService: MapaAgendasService
    ) { }

    ngOnInit() {
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

                            diaSemana.agendas?.forEach(agenda => {

                                let turnos = [];

                                agenda.informacion.asignado.forEach(turno => {


                                    let horaTurno = moment(turno.horaInicio);
                                    let horaInicial = moment(dia.fecha).hour(hora.hora).minute(this.intervalo * aux);
                                    let horaFin = moment(dia.fecha).hour(hora.hora).minute(this.intervalo * (aux + 1));

                                    if (horaTurno.isBetween(horaInicial, horaFin, null, '[)')) {
                                        turnos.push(turno);
                                    }
                                });
                                if (turnos.length > 0) {
                                    intervalo.turnos.push({
                                        turnos: turnos,
                                        nombre: agenda.nombre,
                                        color: agenda.color
                                    });

                                }



                            });
                        }
                    });
                });
            });



        });





    }

    private cabiarSemana() {

        this.semanaSeleccionada = this.calendario.semanas.find(dias => dias.find(dia => dia.fecha && moment(dia.fecha).isSame(this._fecha, 'day')));

        if (this.semanaSeleccionada) {

            this.cargarSemana();

        } else {
            this.mapaAgendaService.cargarAgendasMes(this._fecha);
            this.mapaAgendaService.calendario$.subscribe(calendario => {
                this.semanaSeleccionada = calendario.find(dias => dias.find(dia => dia.fecha && moment(dia.fecha).isSame(this._fecha, 'day')));
                this.cargarSemana();
            });

        }

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


    detalleDia(turno) {

        this.diaDetalle.emit(turno);
    }


}
