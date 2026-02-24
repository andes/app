import { Input, Component, SimpleChanges, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';

@Component({
    selector: 'detalle-solicitud',
    templateUrl: './detalleSolicitud.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class DetalleSolicitudComponent implements OnChanges, OnDestroy {


    @Input() prestacionSeleccionada: any;

    @Input() turnoSeleccionado: any;

    @Input() tipoSolicitud: string;

    @Output() internacionPaciente: EventEmitter<any> = new EventEmitter<any>();

    public internacion = null;
    public organizacionInternacion;
    public tiempoVigencia: number;
    public fechaVencimiento: Date;


    public items = [
        { key: 'solicitud', label: 'SOLICITUD' },
        { key: 'historial', label: 'HISTORIAL' },
        { key: 'turnos', label: 'TURNOS' }
    ];
    public mostrar = 'solicitud';
    public verIndicaciones = false;

    constructor(
        public adjuntosService: AdjuntosService,
        private pacienteService: PacienteService,
        private conceptosTurneablesService: ConceptosTurneablesService
    ) { }

    fotos: any[] = [];

    ngOnChanges(changes: SimpleChanges) {
        if (!changes.prestacionSeleccionada || !this.prestacionSeleccionada) {
            return;
        }

        this.adjuntosService.token$.subscribe((payload) => {
            const { token } = payload;
            const solicitudRegistros = this.prestacionSeleccionada.solicitud.registros;
            const documentos = solicitudRegistros?.[0]?.valor?.documentos || [];
            this.fotos = documentos.map((doc) => {
                return {
                    ...doc,
                    url: this.adjuntosService.createUrl('rup', doc, token)
                };
            });
        });

        if (this.prestacionSeleccionada?.paciente?.id) {
            this.pacienteService
                .getEstadoInternacion(this.prestacionSeleccionada.paciente.id)
                .subscribe(resp => {
                    if (resp) {
                        this.internacion = resp.estado;
                        this.organizacionInternacion = resp.organizacion ?? 'Sin organización';
                    }
                    this.internacionPaciente.emit(this.internacion);
                });
        }

        const conceptId = this.prestacionSeleccionada?.solicitud?.tipoPrestacion?.conceptId;
        if (conceptId) {
            this.conceptosTurneablesService.search({ conceptId }).subscribe(conceptos => {
                this.tiempoVigencia = conceptos?.[0]?.tiempoVigencia || 365;
                const fechaSolicitud = new Date(this.prestacionSeleccionada.solicitud.fecha);
                this.fechaVencimiento = new Date(fechaSolicitud);
                this.fechaVencimiento.setDate(
                    this.fechaVencimiento.getDate() + this.tiempoVigencia
                );
            });
        }
    }

    cambiarOpcion(opcion) {
        this.mostrar = opcion;
    }

    toggleIndicaciones() {
        this.verIndicaciones = !this.verIndicaciones;
    }

    ngOnDestroy() {
        this.internacion = null;
    }
}
