import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { AgendaService } from 'src/app/services/turnos/agenda.service';


@Component({
    selector: 'mapa-agenda-mes',
    templateUrl: 'mapa-agenda-mes.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasMesComponent implements OnInit {

    public headers = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    public parametros;
    public _fecha;
    public calendario;
    @Output() diaDetalle = new EventEmitter<any>();
    @Input() dataF: any;
    @Input('fecha')
    set fecha(value: any) {
        this._fecha = value;
        this.cargarMes();
    }

    constructor(
        private agendaService: AgendaService
    ) { }

    ngOnInit() {

    }

    private cargarMes() {
        this.calendario = [];
        let inicio = moment(this._fecha).startOf('month').startOf('week');
        let ultimoDiaMes = moment(this._fecha).endOf('month');
        let primerDiaMes = moment(this._fecha).startOf('month');
        let cantidadSemanas = Math.ceil(moment(this._fecha).endOf('month').endOf('week').diff(moment(this._fecha).startOf('month').startOf('week'), 'weeks', true));

        for (let r = 1; r <= cantidadSemanas; r++) {
            let week = [];
            this.calendario.push(week);

            for (let c = 1; c <= 7; c++) {
                let dia = inicio.toDate();
                let isThisMonth = inicio.isSameOrBefore(ultimoDiaMes) && inicio.isSameOrAfter(primerDiaMes);
                if (isThisMonth) {
                    week.push({
                        fecha: dia,
                        turnos: []
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

        this.parametros = {
            fechaDesde: moment(this._fecha).startOf('month').toDate(),
            fechaHasta: moment(this._fecha).endOf('month').toDate(),
            organizacion: '',
            idTipoPrestacion: '',
            idProfesional: '',
            espacioFisico: '',
            otroEspacioFisico: '',
            estado: ''
        };

        this.agendaService.get(this.parametros).subscribe((agendas: any) => {
            agendas.forEach(agenda => {
                this.calendario.forEach(semana => {

                    semana.forEach(dia => {

                        if (dia.estado !== 'vacio' && moment(dia.fecha).isSame(agenda.horaInicio, 'day')) {
                            let turnos = [];
                            turnos = agenda.bloques[0].turnos.filter(turno => turno.estado === 'asignado');

                            turnos.forEach(t => this.dataF.forEach(tipoPrestacion => {

                                if (tipoPrestacion.color && t.tipoPrestacion.conceptId === tipoPrestacion.conceptId) {

                                    t.tipoPrestacion['color'] = tipoPrestacion.color;

                                }
                            }));
                            turnos.forEach(turno => dia.turnos.push(turno));
                            dia.turnos.sort((a, b) =>
                                a.tipoPrestacion.conceptId.localeCompare(b.tipoPrestacion.conceptId));
                        }

                    });
                });
            });

        }, err => {
            if (err) {
            }
        });

    }

    detalleDia(dia) {

        this.diaDetalle.emit(dia);
    }


}
