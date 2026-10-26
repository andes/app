import moment from 'moment';
import { Auth } from '@andes/auth';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioIntermedioService } from 'src/app/modules/rup/services/servicio-intermedio.service';
import { MapaAgendasService } from './mapa-agendas.service';

@Component({
    selector: 'mapa-agenda',
    templateUrl: 'mapa-agendas.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasComponent implements OnInit {

    public accion: string;
    public agendas_dia;
    public dia;
    public prestacionesPermisos;
    public verMes = true;
    public diaInicio = new Date();
    public verSemana = false;
    public mostrarFiltroServicio = false;
    public serviciosIntermedio = [];
    public servicioIntermedio = null;
    constructor(
        private auth: Auth,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private mapaAgendasService: MapaAgendasService,
        private servicioIntermedioService: ServicioIntermedioService

    ) { }

    ngOnInit() {
        const { modulo } = this.activeRoute.snapshot.data;
        let serviciosPermisos = [];
        if (modulo === 'rup') {
            this.mapaAgendasService.setPermisos('rup:tipoPrestacion:?');
            this.prestacionesPermisos = this.auth.getPermissions('rup:tipoPrestacion:?');
            serviciosPermisos = this.auth.getPermissions('rup:servicio-intermedio:?') || [];
            this.mostrarFiltroServicio = serviciosPermisos.length > 0;
            if (this.mostrarFiltroServicio) {
                this.servicioIntermedioService.getAll().subscribe(servicios => {
                    this.serviciosIntermedio = (servicios || []).filter(servicio =>
                        serviciosPermisos[0] === '*' || serviciosPermisos.indexOf(servicio.id) >= 0
                    );
                });
            }
        } else {
            this.mapaAgendasService.setPermisos('turnos:planificarAgenda:prestacion:?');
            this.prestacionesPermisos = this.auth.getPermissions('turnos:planificarAgenda:prestacion:?');
        }
        if (!(this.prestacionesPermisos && this.prestacionesPermisos.length) && !serviciosPermisos.length) {
            this.router.navigate(['inicio']);
        }
    }

    filtrarServicioIntermedio(servicio) {
        const id = servicio?.id || null;
        const idActual = this.mapaAgendasService.servicioIntermedio?.id || null;
        if (id === idActual) {
            return;
        }
        this.accion = null;
        this.servicioIntermedio = servicio || null;
        this.mapaAgendasService.setServicioIntermedio(this.servicioIntermedio);
        this.mapaAgendasService.cargarAgendasMes(this.diaInicio);
    }


    visualizarSemana(semana) {

        this.accion = null;
        const diaSema = semana.find(dia => !dia.estado);
        this.verSemana = true;
        this.verMes = false;
        this.diaInicio = moment(diaSema.fecha).toDate();
    }

    visualizarMes() {
        this.accion = null;
        this.verSemana = false;
        this.diaInicio = moment(this.diaInicio).toDate();
        this.verMes = true;
    }

    verAgendas(dia) {
        // agrupo por agendas
        const agenda_Prestaciones = [];
        const agendas = {};
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
