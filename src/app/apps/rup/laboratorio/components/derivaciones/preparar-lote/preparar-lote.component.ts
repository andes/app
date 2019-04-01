import { Constantes } from './../../../controllers/constants';
import { LoteDerivacionService } from './../../../services/loteDerivacion.service';
import { ILoteDerivacion } from './../../../interfaces/practica/ILoteDerivacion';
import { Auth } from '@andes/auth';
import { OrganizacionService } from './../../../../../../services/organizacion.service';
import { AreaLaboratorioService } from './../../../services/areaLaboratorio.service';
import { ProtocoloService } from '../../../services/protocolo.service';
import { OnInit, Component } from '@angular/core';



@Component({
    selector: 'preparar-lote',
    templateUrl: 'preparar-lote.html',
    styleUrls: ['../../../assets/laboratorio.scss']
})

export class PrepararLoteComponent implements OnInit {
    area;
    areas;
    desde = new Date();
    hasta = new Date();
    organizacionDerivacion;
    practicas;
    estado;

    lote: ILoteDerivacion;

    protocolos = [];

    constructor(
        private auth: Auth,
        private protocoloService: ProtocoloService,
        private areaLaboratorioService: AreaLaboratorioService,
        private organizacionService: OrganizacionService,
        private loteDerivacionService: LoteDerivacionService
    ) { }

    ngOnInit() {
        this.cargarAreasLaboratorio();
        this.iniciarLote();
        this.buscar(null, null);
    }

    /**
     *
     *
     * @private
     * @memberof PrepararLoteComponent
     */
    private iniciarLote() {
        this.lote = {
            laboratorioOrigen: {
                nombre: this.auth.organizacion.nombre,
                id: this.auth.organizacion.id
            },
            estados: [{ tipo: Constantes.estadosLotes.preparado }],
            itemsLoteDerivacion: []
        };
    }

    /**
     *
     *
     * @param {*} $event
     * @param {*} [x]
     * @memberof PrepararLoteComponent
     */
    buscar($event, tipo?) {
        if (tipo && tipo === 'organizacionDerivacion') {
            if ($event.value && $event.value.id) {
                this.lote.laboratorioDestino = {
                    nombre: $event.value.nombre,
                    id: $event.value.id
                };
            } else {
                this.lote.laboratorioDestino = null;
            }
        }
        this.lote.itemsLoteDerivacion = [];
        this.protocoloService.get(this.getParams()).subscribe(res => this.protocolos = res);
    }

    /**
     *
     *
     * @private
     * @memberof PrepararLoteComponent
     */
    private getParams() {
        let params: any = {
            pendientesDerivacion: true,
            organizacionDestino: this.auth.organizacion._id,
            solicitudDesde: this.desde,
            solicitudHasta: this.hasta
        };
        if (this.organizacionDerivacion) {
            params.organizacionDerivacion = this.organizacionDerivacion._id;
        }
        if (this.area) {
            params.areas = this.area.id;
        }
        if (this.practicas) {
            params.practicas = this.practicas;
        }
        if (this.estado) {
            params.estado = this.estado;
        }
        return params;
    }

    /**
     *
     * @memberof PrepararLoteComponent
     */
    private cargarAreasLaboratorio() {
        this.areaLaboratorioService.get().subscribe((areas: any) => {
            this.areas = areas.map((area) => {
                return {
                    id: area._id,
                    nombre: area.nombre
                };
            });
        });
    }

    /**
     *
     *
     * @param {*} event
     * @memberof PrepararLoteComponent
     */
    loadOrganizaciones(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.organizacionService.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    /**
     *
     *
     * @memberof PrepararLoteComponent
     */
    async guardarLoteDerivacion() {
        let a = await this.loteDerivacionService.post(this.lote).subscribe(() => {
            this.protocoloService.get(this.getParams()).subscribe(res => this.protocolos = res);
        });
    }
}

