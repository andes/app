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
    desde;
    hasta;
    organizacionDestino;
    practicas;
    estado;

    constructor(
        private protocoloService: ProtocoloService,
        private areaLaboratorioService: AreaLaboratorioService,
        private organizacionService: OrganizacionService
    ) { }

    ngOnInit() {
        this.cargarAreasLaboratorio();
    }

    /**
     *
     *
     * @param {*} $event
     * @param {*} [x]
     * @memberof PrepararLoteComponent
     */
    buscar($event, x?) {
        console.log($event, x);
    }

    /**
     *
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

    onChangeSelectArea(event) {
        event.callback([]);
    }
}

