import { Input, Component, SimpleChanges, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { Auth } from '@andes/auth';

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
    public permisoDetalle = false;

    public items = [];

    public mostrar = 'solicitud';
    public verIndicaciones = false;

    constructor(
        public adjuntosService: AdjuntosService,
        private pacienteService: PacienteService,
        private auth: Auth
    ) { }

    fotos: any[] = [];
    ngOnChanges(changes: SimpleChanges) {
        if (changes.prestacionSeleccionada) {
            this.permisoDetalle = this.auth.hasExactPermission('solicitudes:verDetalles');
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
            if (this.prestacionSeleccionada?.paciente?.id) {
                this.pacienteService.getEstadoInternacion(this.prestacionSeleccionada.paciente.id).subscribe(resp => {
                    if (resp) {
                        this.internacion = resp.estado;
                        this.organizacionInternacion = resp.organizacion ? resp.organizacion : 'Sin organización';
                    }
                    this.internacionPaciente.emit(this.internacion);
                });
            }
            this.buildItems();
        }
    }

    private buildItems() {
        const base = [
            { key: 'solicitud', label: 'SOLICITUD' },
            { key: 'historial', label: 'HISTORIAL' },
            { key: 'turnos', label: 'TURNOS' }
        ];

        // Ejemplo de condición: agregar 'turnos' solo si se cumple permisoDetalle
        // o si el tipo de solicitud es un valor específico. Ajusta aquí.
        if (this.permisoDetalle) {
            base.splice(1, 0, { key: 'pedido', label: 'PEDIDO' });
        }

        this.items = base;
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
