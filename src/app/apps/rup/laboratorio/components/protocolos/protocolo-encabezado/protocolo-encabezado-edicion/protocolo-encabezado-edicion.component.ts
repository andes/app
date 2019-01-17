import { ProfesionalService } from '../../../../../../../services/profesional.service';
import { OrganizacionService } from '../../../../../../../services/organizacion.service';
import { Input, Output, Component, OnInit, EventEmitter } from '@angular/core';
import { getPrioridadesLab, getOrigenLab } from '../../../../../../../utils/enumerados';
import { Auth } from '@andes/auth';

@Component({
    selector: 'protocolo-encabezado-edicion',
    templateUrl: './protocolo-encabezado-edicion.html',
    styleUrls: ['../../../../assets/laboratorio.scss']
})

export class ProtocoloEncabezadoEdicionComponent implements OnInit {
    modelo: any;
    solicitudProtocolo: any;
    mostrarMasOpciones: Boolean;
    organizacion: any;
    origen: any;
    @Input() seleccionPaciente: Boolean;
    @Input() modo: String;

    @Input('protocolo')
    set protocolo(value: any) {
        if (value) {
            this.cargarProtocolo(value);
        }
    }
    @Output() siguienteEmit = new EventEmitter<any>();
    @Output() anteriorEmit = new EventEmitter<any>();
    @Output() cambiarPacienteEmitter = new EventEmitter<any>();

    constructor(
        public auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private servicioProfesional: ProfesionalService,
    ) { }

    ngOnInit() {
    }

    /**
     *
     *
     * @param {*} value
     * @memberof ProtocoloEncabezadoEdicionComponent
     */
    cargarProtocolo(value: any) {
        this.modelo = value;
        this.origen = {
            id: this.modelo.solicitud.ambitoOrigen,
            nombre: this.modelo.solicitud.ambitoOrigen
        };
        this.solicitudProtocolo = this.modelo.solicitud.registros[0].valor;
    }

    cambiarPaciente() {
        this.cambiarPacienteEmitter.emit();
    }

    /**
    * Busca unidades organizativas de la organización
    *
    * @param {any} $event
    * @memberof PuntoInicioLaboratorioComponent
    */
    loadServicios($event) {
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe((organizacion: any) => {
            $event.callback(organizacion.unidadesOrganizativas);
        });
    }

    /**
     * Recupera lista de organizaciones
     *
     * @param {any} event
     * @memberof PuntoInicioLaboratorioComponent
     */
    loadOrganizaciones(event) {
        if (event.query) {
            this.servicioOrganizacion.get({ nombre: event.query } ).subscribe(event.callback);
        } else {
            event.callback( this.modelo.solicitud.organizacion ? this.modelo.solicitud.organizacion : [] );
        }
    }

    /**
     * Devuelve lista de prioridades predefinidas para prestaciones de laboratorio
     * @param {any} event
     * @returns
     * @memberof PuntoInicioLaboratorioComponent
     */
    loadPrioridad(event) {
        event.callback(getPrioridadesLab());
    }

    /**
     * Busca y carga lista de profesionales
     *
     * @param {any} $event
     * @memberof ProtocoloDetalleComponent
     */
    loadProfesionales($event) {
        if ($event.query) {
            this.servicioProfesional.get({ nombreCompleto: $event.query }).subscribe($event.callback);
        } else if (this.modelo.solicitud.profesional && this.modelo.solicitud.profesional.id) {
            $event.callback(this.modelo.solicitud.profesional);
        }
    }

    /**
     * Busca ambito de origen
     *
     * @param {any} $event
     * @memberof ProtocoloDetalleComponent
     */
    loadOrigen($event) {
        $event.callback(getOrigenLab());
    }

    /**
     *
     *
     * @memberof ProtocoloEncabezadoEdicionComponent
     */
    setAmbitoOrigen(event) {
        this.modelo.solicitud.ambitoOrigen = this.origen ? this.origen.id : null;
    }
}
