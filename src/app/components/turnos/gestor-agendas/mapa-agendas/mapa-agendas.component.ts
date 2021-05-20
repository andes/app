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
    public semana = [];
    public horaInicio = 6;
    public horaFin = 20;
    public horarios = [];
    public filasPorHorario;
    public parametros;
    public intervalo = 30;
    public diaInicio;
    public agendasDeLaSemana = [];
    public prestacionesPermisos;
    public verDia = false;
    public verMes = false;
    public fecha;
    public dataF;
    public verSemana = true;
    constructor(

        private agendaService: AgendaService,
        private auth: Auth,
        private conceptoTurneablesService: ConceptosTurneablesService,
        private router: Router

    ) { }

    ngOnInit() {
        this.prestacionesPermisos = this.auth.getPermissions('turnos:planificarAgenda:prestacion:?');

        if (!this.prestacionesPermisos.length) {
            this.router.navigate(['inicio']);
        }
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
        let fechaDesde = moment(this.diaInicio).startOf('week').toDate();
        let fechaHasta = moment(this.diaInicio).endOf('week').toDate();
        if (this.verDia) {
            fechaDesde = moment(this.diaInicio).startOf('day').toDate();
            fechaHasta = moment(this.diaInicio).endOf('day').toDate();
        }

        this.parametros = {
            fechaDesde: fechaDesde,
            fechaHasta: fechaHasta,
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
            if (this.prestacionesPermisos[0] === '*') {
                this.dataF = data;
            } else {
                this.dataF = data.filter((x) => { return this.prestacionesPermisos.indexOf(x.id) >= 0; });
            }

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

    private visualizarDia() {
        this.verDia = true;
        this.verSemana = false;
        this.verMes = false;
        this.diaInicio = moment(this.diaInicio);
    }

    private visualizarSemana() {
        this.verSemana = true;
        this.verDia = false;
        this.verMes = false;
        this.cargarSemana();
    }

    private visualizarMes() {
        this.verDia = false;
        this.verSemana = false;
        this.diaInicio = moment(this.diaInicio);
        this.verMes = true;
    }
}
