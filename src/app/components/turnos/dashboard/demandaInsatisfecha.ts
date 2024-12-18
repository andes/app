import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';
import { ListaEsperaService } from 'src/app/services/turnos/listaEspera.service';
import { ProfesionalService } from './../../../services/profesional.service';

@Component({
    selector: 'demandaInsatisfecha',
    templateUrl: 'demandaInsatisfecha.html',
    styleUrls: ['demandaInsatisfecha.scss']
})

export class demandaInsatisfechaComponent {

    @Input() paciente: IPaciente;
    @Input() origen = 'citas';
    @Input() estado = 'pendiente';
    @Output() demandaCerrada = new EventEmitter<any>();
    @ViewChild('modalSolicitudes', { static: true }) modalSolicitudes: PlexModalComponent;
    @ViewChild('modalTurno', { static: true }) modalTurno: PlexModalComponent;

    tipoPrestacion: any;
    permisos = [];
    profesional: any;
    motivos = [
        { id: 1, nombre: 'No existe la oferta en el efector' },
        { id: 2, nombre: 'No hay turnos disponibles' },
        { id: 3, nombre: 'Oferta rechazada por el paciente' }
    ];
    motivo: any;
    organizacion = this.auth.organizacion;
    solicitudesAsociadas;
    turnoAsociado;

    constructor(
        public auth: Auth,
        public plex: Plex,
        public conceptosTurneablesService: ConceptosTurneablesService,
        public profesionalService: ProfesionalService,
        public listaEsperaService: ListaEsperaService,
        public servicioPrestacion: PrestacionesService,
    ) { }

    loadTipoPrestaciones(event) {
        this.conceptosTurneablesService.getByPermisos(null, 'ambulatorio').subscribe((data) => {
            event.callback(data);
        });
    }

    loadProfesionales(event) {
        const query = {
            nombreCompleto: event.query,
            habilitado: true
        };
        this.profesionalService.get(query).subscribe(event.callback);
    }

    guardar() {
        if (this.motivo && this.tipoPrestacion) {
            const params = {
                idPaciente: this.paciente.id,
                prestacionDestino: this.tipoPrestacion?.conceptId,
                estados: [
                    'auditoria',
                    'pendiente',
                ]
            };

            const listaEsperaService$ = this.listaEsperaService.save(
                { id: this.paciente.id },
                this.tipoPrestacion,
                this.estado,
                this.profesional,
                this.organizacion,
                this.motivo.nombre,
                this.origen,
                false
            );

            listaEsperaService$
                .pipe(
                    catchError((err) => {
                        if (err.code === 'turno_existente') {
                            const { data } = err;
                            const dia = moment(data.horaInicio).format('LL');
                            const horario = moment(data.horaInicio).format('HH:mm');
                            const profesionales = data.profesionale ? data.profesionales.map(prof => ` ${prof.nombre} ${prof.apellido}`) : 'Sin profesionales asignados';
                            const organizacion = data.organizacion?.nombre || null;

                            this.turnoAsociado = { dia, horario, profesionales, organizacion };
                        } else {
                            this.plex.info('danger', err, 'No se pudo conectar con el servidor');
                        }

                        return throwError(() => err);
                    }),
                    switchMap(() =>
                        this.servicioPrestacion.getSolicitudes(params).pipe(
                            catchError(() => {
                                this.plex.toast('success', 'Demanda insatisfecha guardada exitosamente!');
                                this.cerrar();

                                return throwError(() => new Error('Error al obtener solicitudes'));
                            })
                        )
                    ),
                )
                .subscribe({
                    next: (solicitudes) => {
                        if (solicitudes?.length) {
                            this.solicitudesAsociadas = solicitudes;
                            this.modalSolicitudes.show();
                        } else {
                            this.plex.toast('success', 'Demanda insatisfecha guardada exitosamente!');
                            this.cerrar();
                        }
                    },
                    error: () => this.modalTurno.show()
                });
        }
    }

    cerrar() {
        this.demandaCerrada.emit();
        this.modalSolicitudes.close();
    }
}
