import { Input, Component, SimpleChanges, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';

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

    public items = [
        { key: 'solicitud', label: 'SOLICITUD' },
        { key: 'historial', label: 'HISTORIAL' }
    ];
    public mostrar;
    public verIndicaciones = false;

    constructor(
        public adjuntosService: AdjuntosService,
        private pacienteService: PacienteService
    ) { }

    fotos: any[] = [];

    ngOnChanges(changes: SimpleChanges) {
        if (changes.prestacionSeleccionada) {
            this.adjuntosService.token$.subscribe((payload) => {
                const { token } = payload;
                const solicitudRegistros = this.prestacionSeleccionada.solicitud.registros;
                const documentos = solicitudRegistros[0].valor.documentos || [];
                this.fotos = documentos.map((doc) => {
                    return {
                        ...doc,
                        url: this.adjuntosService.createUrl('rup', doc, token)
                    };
                });
            });
        }
        this.pacienteService.getEstadoInternacion(this.prestacionSeleccionada.paciente.id).subscribe(resp => {

            if (resp) {
                this.internacion = resp.estado;
                this.organizacionInternacion = resp.organizacion ? resp.organizacion : 'Sin organización';
            }
            this.internacionPaciente.emit(this.internacion);
        });
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
