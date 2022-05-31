import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacientePortalService } from '../../services/paciente-portal.service';
import { AgendaService } from 'src/app/services/turnos/agenda.service';
import { TurnoService } from 'src/app/services/turnos/turno.service';
import { TurnoService as TurnoPortalService } from '../../services/turno.service';
import { Plex } from '@andes/plex';

@Component({
    selector: 'pdp-dar-turno-detalle',
    templateUrl: './dar-turno-detalle.component.html',
    styles: [`
        .fix-height {
            height: 190px;
        }
    `]
})

export class DarTurnoDetalleComponent implements OnInit {
    public turnosDisponibles;
    public agenda;
    public paciente;
    public prestacion;
    public turnoDado = false;
    public turnoSelected;
    public profesionales;
    public inProgress = true;
    public columns = [
        {
            key: 'hora',
            label: 'Fecha y Hora',
            sorteable: false,
            opcional: false
        },
        {
            key: 'acciones',
            sorteable: false,
            opcional: false
        }];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private agendasService: AgendaService,
        private pacienteServiceProtal: PacientePortalService,
        private turnoService: TurnoService,
        private turnoPortalService: TurnoPortalService,
        private plex: Plex
    ) { }

    ngOnInit(): void {
        this.inProgress = true;
        this.turnoPortalService.tipoPrestacionSubject.subscribe(prestacion => {
            this.prestacion = prestacion;
            this.turnoDado = false;
        });
        this.turnoPortalService.profesionalSubject.subscribe(profesional => {
            this.profesionales = profesional;
        });
        this.route.params.subscribe(params => {
            const id = params['idAgenda'];
            this.agendasService.getById(id).subscribe(agenda => {
                this.agenda = agenda;
                this.turnosDisponibles = [];
                agenda.bloques.forEach(bloque => {
                    const bloqueAux = bloque.tipoPrestaciones.some(elem => elem.conceptId === this.prestacion.conceptId);
                    if (bloqueAux) {
                        const bloqueDisponible = bloque.turnos.filter(turno => turno.estado === 'disponible');
                        this.turnosDisponibles = [...this.turnosDisponibles, ...bloqueDisponible];
                    }
                });
                this.inProgress = false;
            });
        });
    }

    confirmarTurno(turno) {
        this.turnoSelected = turno;
        let idBloque;
        this.agenda.bloques.forEach(bloque => {
            bloque.turnos.forEach(turnoBloque => {
                if (turnoBloque._id === turno._id) {
                    idBloque = bloque._id;
                }
            });
        });
        this.pacienteServiceProtal.me().subscribe((paciente: any) => {
            this.paciente = paciente;
            // Se busca entre los contactos del paciente un celular
            let telefono = '';
            if (paciente?.contacto?.length) {
                paciente.contacto.forEach((contacto) => {
                    if (contacto.tipo === 'celular') {
                        telefono = contacto.valor;
                    }
                });
            }
            // Datos del paciente
            const pacienteSave = {
                id: paciente.id,
                documento: paciente.documento,
                numeroIdentificacion: paciente.numeroIdentificacion,
                apellido: paciente.apellido,
                nombre: paciente.nombre,
                alias: paciente.alias,
                fechaNacimiento: paciente.fechaNacimiento,
                sexo: paciente.sexo,
                genero: paciente.genero,
                telefono,
                carpetaEfectores: paciente.carpetaEfectores
            };
            // Datos del Turno
            const datosTurno = {
                idAgenda: this.agenda._id,
                idTurno: turno._id,
                idBloque: idBloque,
                paciente: pacienteSave,
                tipoPrestacion: this.prestacion,
                tipoTurno: 'programado',
                emitidoPor: 'appMobile',
                nota: 'Turno pedido desde app móvil',
                motivoConsulta: ''
            };
            this.turnoService.save(datosTurno).subscribe(() => {
                this.turnoPortalService.turnoDadoSubject.next(true);
                this.turnoDado = true;
            }, (error) => {
                if (error === 'La agenda ya no está disponible') {
                    this.plex.info('danger', 'La agenda ya no está disponible.');
                    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                        this.router.navigate(['mis-turnos']);
                    });
                } else {
                    this.plex.info('danger', 'El turno ya no está disponible, seleccione otro turno.');
                    this.turnoPortalService.turnoDadoSubject.next(true);
                    this.ngOnInit();
                }
            });
        });
    }

    volver() {
        this.router.navigate(['mis-turnos']);
    }
}
