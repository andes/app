import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Component, OnInit } from '@angular/core';
import { ConsultaComponent } from 'src/app/apps/vacunacion/components/consulta.component';
import { forEach } from 'vis-util/esnext';

@Component({
    selector: 'mapa-agenda',
    templateUrl: 'mapa-agendas.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasComponent implements OnInit {

    accion;
    agendas_dia;
    dia;
    public prestacionesPermisos;
    public verMes = true;
    public diaInicio = new Date();
    public verSemana = false;
    public calendario;
    constructor(
        private auth: Auth,
        private router: Router,

    ) { }

    ngOnInit() {
        this.prestacionesPermisos = this.auth.getPermissions('rup:tipoPrestacion:?');

        if (!this.prestacionesPermisos.length) {
            this.router.navigate(['inicio']);
        }
    }


    visualizarSemana(calendario) {
        this.accion = null;
        let diaSema = calendario.semanas[calendario.indice].find(dia => !dia.estado);

        this.calendario = calendario;
        this.verSemana = true;

        this.verMes = false;
        this.diaInicio = moment(diaSema.fecha);
    }

    visualizarMes() {
        this.accion = null;
        this.verSemana = false;
        this.diaInicio = moment(this.diaInicio);
        this.verMes = true;
    }

    verAgendas(dia) {
        // agrupo por agendas
        let agenda_Prestaciones = [];
        let agendas = {};
        dia.prestaciones.forEach(p => {

            if (!agendas[p.agenda.id]) {
                agendas[p.agenda.id] = {
                    Prestaciones: [],
                    agenda: p.agenda,
                    fecha: dia.fecha

                };
            }

            agendas[p.agenda.id].Prestaciones.push(p);

        });

        for (const property in agendas) {

            agenda_Prestaciones.push(agendas[property]);
        }

        this.accion = 'verDetalle';
        this.agendas_dia = agenda_Prestaciones;
    }

    turnos(dia) {
        this.accion = 'verDetalle';
        this.dia = dia;
    }

    close() {
        this.accion = null;
    }
}
