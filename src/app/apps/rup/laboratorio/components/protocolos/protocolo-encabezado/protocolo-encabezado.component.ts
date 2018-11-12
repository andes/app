import { ProfesionalService } from './../../../../../../services/profesional.service';
import { OrganizacionService } from './../../../../../../services/organizacion.service';
import { Input, Output, Component, OnInit, EventEmitter } from '@angular/core';
import { IPrestacion } from '../../../../../../modules/rup/interfaces/prestacion.interface';
import { getPrioridadesLab , getOrigenFiltroLab} from '../../../../../../utils/enumerados';
import { Auth } from '@andes/auth';


@Component({
    selector: 'protocolo-encabezado',
    templateUrl: './protocolo-encabezado.html',
    styleUrls: ['../../../assets/laboratorio.scss']
})

export class ProtocoloEncabezadoComponent implements OnInit {

    modelo: any;
    solicitudProtocolo: any;
    @Input() modo: String;
    edicionDatosCabecera: Boolean;
    @Input('edicionDatosCabecera')
    set asd(value) {
        console.log('edicionDatosCabecera', value);
        this.edicionDatosCabecera = value;
    }


    @Input() seleccionPaciente: Boolean;
    @Input('protocolo')
    set protocolo(value: any) {
        if (value) {
            this.cargarProtocolo(value);
        }
    }
    @Output() siguienteEmit = new EventEmitter<any>();
    @Output() anteriorEmit = new EventEmitter<any>();


    constructor(
        public auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private servicioProfesional: ProfesionalService,
    ) { }

    ngOnInit() {
        // this.setProtocoloSelected(this.modelo);
    }

    cargarProtocolo(value: any) {
        console.log('cargarProtocolo', value);
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
  * Busca unidades organizativas de la organización
  *
  * @param {any} $event
  * @memberof PuntoInicioLaboratorioComponent
  */
    loadServicios($event) {
        console.log('loadServicios');
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe((organizacion: any) => {
            let servicioEnum = organizacion.unidadesOrganizativas;
            $event.callback(servicioEnum);
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
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
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
        return getPrioridadesLab();
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
 * Busca ambito de origen
 *
 * @param {any} $event
 * @memberof ProtocoloDetalleComponent
 */
    loadOrigen($event) {
        $event.callback(getOrigenFiltroLab());
    }
}
