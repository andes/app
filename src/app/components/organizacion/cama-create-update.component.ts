import { HostBinding, Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../services/organizacion.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'cama-create-update',
    templateUrl: 'cama-create-update.html'
})
export class CamaCreateUpdateComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public organizacion: any;

    public cama = {
        sector: null,
        habitacion: null,
        numero: null,
        servicio: null,
        tipoCama: null,
        equipamientos: []
    };

    constructor(
        public plex: Plex,
        public OrganizacionService: OrganizacionService,
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let id = params['id'];
            console.log(id);
            this.OrganizacionService.getById(id).subscribe(organizacion => {
                console.log(organizacion, 'organi');
                this.organizacion = organizacion;
            });
        });
    }

    save() {


    }
    cancel() {

    }

    loadServicios($event) {
        let servicios = this.organizacion.servicios.map(elem => {
            return { id: elem.conceptId, nombre: elem.term };
        });
        $event.callback(servicios);
    }
    loadEquipamientos() {
        /**
         * aca van los equipamientos ver si van a salir de un refset o de una query
         */

    }

}
