import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AgendaService } from 'src/app/services/turnos/agenda.service';


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
    public parametros;
    public intervalo = 30;
    public agendasDeLaSemana = [];
    public _fecha;
    @Output() diaDetalle = new EventEmitter<any>();
    @Input() dataF: any;
    @Input('fecha')
    set fecha(value: any) {
        this._fecha = value;
        this.cargarSemana();
    }

    constructor(
        private agendaService: AgendaService
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


        this.parametros = {
            fechaDesde: moment(this._fecha).startOf('week').toDate(),
            fechaHasta: moment(this._fecha).endOf('week').toDate(),
            organizacion: '',
            idTipoPrestacion: '',
            idProfesional: '',
            espacioFisico: '',
            otroEspacioFisico: '',
            estado: ''
        };

        this.agendaService.get(this.parametros).subscribe((agendas: any) => {
            agendas.forEach(agenda => {

                this.semana.forEach(dia => {

                    if (moment(dia.fecha).isSame(agenda.horaInicio, 'day')) {

                        let turnos = agenda.bloques[0].turnos.filter(turno => turno.estado === 'asignado');
                        turnos.forEach(t => this.dataF.forEach(tipoPrestacion => {

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


    detalleDia(dia) {

        this.diaDetalle.emit(dia);
    }

}
