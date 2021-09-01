import { Plex } from '@andes/plex';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AgendaService } from 'src/app/services/turnos/agenda.service';
import { TurnoService } from '../../services/turno.service';


@Component({
    selector: 'pdp-dar-turno',
    templateUrl: './dar-turno.component.html'
})

export class DarTurnoComponent implements OnInit {
    @Output() detalleTurnos = new EventEmitter<any>();


    public latitude;
    public longitude;
    public organizacionAgendas;
    public prestacionesTurneables = [];
    public turnosActuales = [];
    public inProgress = true;

    constructor(
        private agendasService: AgendaService,
        private turnosServicePortal: TurnoService,
        private plex: Plex,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.turnosServicePortal.getTurnos().subscribe(turnos => {
            this.turnosActuales = turnos;
            navigator.geolocation.getCurrentPosition(position => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                this.getAgendasDisponibles({ lat: this.latitude, lng: this.longitude });
            },
            (error) => {
                this.plex.info('warning', 'Para obtener los turnos disponibles debe activar su ubicación', 'Atención');
                const currentUrl = this.router.url;
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate([currentUrl]);
                });
            });
        });
        this.turnosServicePortal.turnoDadoSubject.subscribe(turno => {
            if (turno) {
                this.turnosServicePortal.getTurnos().subscribe(turnos => {
                    this.turnosActuales = turnos;
                    this.getAgendasDisponibles({ lat: this.latitude, lng: this.longitude });
                    this.turnosServicePortal.turnoDadoSubject.next(null);
                });
            }
        });
    }

    getAgendasDisponibles(userLocation) {
        this.inProgress = true;
        this.agendasService.getAgendasDisponibles({ userLocation: JSON.stringify(userLocation) })
            .subscribe((data: any[]) => {
                this.organizacionAgendas = data;
                this.buscarPrestaciones(data);
            });
    }

    // Busca los tipos de prestación turneables y verifica que ya el paciente no haya sacado un turno para ese tipo de prestación.
    buscarPrestaciones(organizacionAgendas) {
        this.prestacionesTurneables = [];
        organizacionAgendas.forEach(org => {
            org.agendas.forEach(agenda => {
                agenda.bloques.forEach(bloque => {
                    if (bloque.restantesMobile > 0) {
                        bloque.tipoPrestaciones.forEach(prestacion => {
                            const exists = this.prestacionesTurneables.some(elem => elem.prestacion.conceptId === prestacion.conceptId);
                            const conTurno = this.turnosActuales.some(turno => turno.tipoPrestacion.conceptId === prestacion.conceptId);
                            if (!exists && !conTurno) {
                                const agendaPrestacion = {
                                    idAgenda: agenda._id,
                                    prestacion: prestacion,
                                    organizacion: agenda.organizacion.nombre,
                                    profesionales: agenda.profesionales,
                                    horaInicio: agenda.horaInicio
                                };
                                this.prestacionesTurneables.push(agendaPrestacion);
                            }
                        });
                    }
                });
            });
        });
        this.inProgress = false;
    }

    selectPrestacion(prestacionSelected) {
        this.turnosServicePortal.tipoPrestacionSubject.next(prestacionSelected.prestacion);
        this.turnosServicePortal.profesionalSubject.next(prestacionSelected.profesionales);
        this.detalleTurnos.emit(prestacionSelected);
    }

}
