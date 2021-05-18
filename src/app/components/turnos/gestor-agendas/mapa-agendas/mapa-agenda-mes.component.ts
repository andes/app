import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Component, Input, OnInit } from '@angular/core';
import { AgendaService } from 'src/app/services/turnos/agenda.service';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';

@Component({
    selector: 'mapa-agenda-mes',
    templateUrl: 'mapa-agenda-mes.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasMesComponent implements OnInit {

    public headers = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];


    public parametros;
    public _fecha;
    public semana = [];
    public prestacionesPermisos;
    public verDia = false;
    @Input('fecha')
    set fecha(value: any) {
        this._fecha = value;
        this.cargarMes();
    }
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
        this.cargarMes();

    }

    private cargarMes() {

        this.semana = this.headers.map((dia, index) => {
            return {
                nombre: dia,
                fecha: this._fecha.weekday(index).toDate(),
                turnos: []
            };

        });
        this.cargarTabla();
    }


    private cargarTabla() {
        let fechaDesde = moment(this._fecha).startOf('month').toDate();
        let fechaHasta = moment(this._fecha).endOf('month').toDate();

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







}
