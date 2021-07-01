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
        this.prestacionesPermisos = this.auth.getPermissions('turnos:planificarAgenda:prestacion:?');

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
        this.accion = 'verDetalle';
        this.dia = dia;
    }

    turnos(dia) {

        dia.agenda.agendasPorPrestacion.forEach(agendaPrestacion =>
            agendaPrestacion.agenda.bloques.forEach(bloque =>
                bloque.turnos.forEach(turno =>
                    dia.turnos.forEach(turnoDia => {
                        if (turno.id === turnoDia.id) {

                            turnoDia['agenda'] = agendaPrestacion.agenda;

                        }


                    }

                    )
                )));

        this.accion = 'verDetalle';
        this.dia = dia;
    }

    close() {
        this.accion = null;
    }
}
