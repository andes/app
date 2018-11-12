import { Input, Output, Component, OnInit, EventEmitter } from '@angular/core';
import { IPrestacion } from '../../../../../../modules/rup/interfaces/prestacion.interface';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as enumerados from './../../../../../../utils/enumerados';
// Servicios
import { ProfesionalService } from '../../../../../../services/profesional.service';
import { OrganizacionService } from '../../../../../../services/organizacion.service';

@Component({
    selector: 'protocolo-encabezado',
    templateUrl: './protocolo-encabezado.html',
    styleUrls: ['../../../assets/laboratorio.scss']
})

export class ProtocoloEncabezadoComponent implements OnInit {

    modelo: any;
    solicitudProtocolo: any;
    mostrarMasOpciones: Boolean;
    organizacion: any;
    @Input() modo: String;
    @Input() edicionDatosCabecera: Boolean;
    @Input('protocolo')
    set protocolo(value: any) {
        if (value) {
            this.cargarProtocolo(value);
        }
    }
    @Output() siguienteEmit = new EventEmitter<any>();
    @Output() anteriorEmit = new EventEmitter<any>();

    cargarProtocolo(value: any) {
        console.log('cargarProtocolo');
        this.modelo = value;
        this.solicitudProtocolo = this.modelo.solicitud.registros[0].valor;
    }

    setProtocoloSelected(protocolo: IPrestacion) {
        console.log('setProtocoloSelected');
        this.modelo = protocolo;
        this.solicitudProtocolo = this.modelo.solicitud.registros[0].valor;
    }

    siguiente() {
        this.siguienteEmit.emit();
    }

    anterior() {
        this.anteriorEmit.emit();
    }

    editarDatosCabecera() {

    }

    /**
 * Busca y carga lista de profesionales
 *
 * @param {any} $event
 * @memberof ProtocoloDetalleComponent
 */
    loadProfesionales($event) {
        let query = {
            nombreCompleto: $event.query
        };
        this.servicioProfesional.get(query).subscribe((resultado: any) => {
            $event.callback(resultado);
        });
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
     *
     *
     * @memberof ProtocoloDetalleComponent
     */
    loadOrganizacion($event) {
        console.log('loadOrganizacion', this.auth.organizacion);
        this.modelo.solicitud.organizacion = this.auth.organizacion;
        this.servicioOrganizacion.get(this.modelo.solicitud.organizacion.nombre).subscribe(resultado => {
            let salida = resultado.map(elem => {
                return {
                    'id': elem.id,
                    'nombre': elem.nombre
                };
            });
            this.organizacion = salida;
        });
    }

    /**
     * Busca prioridades
     *
     * @param {any} $event
     * @memberof ProtocoloDetalleComponent
     */
    loadPrioridad($event) {
        $event.callback(enumerados.getPrioridadesLab());
    }
    /**
     * Busca ambito de origen
     *
     * @param {any} $event
     * @memberof ProtocoloDetalleComponent
     */
    loadOrigen($event) {
        $event.callback(enumerados.getOrigenFiltroLab());
    }

    constructor(public auth: Auth, private servicioProfesional: ProfesionalService, private servicioOrganizacion: OrganizacionService) { }

    ngOnInit() {
        // this.setProtocoloSelected(this.modelo);
    }

}
