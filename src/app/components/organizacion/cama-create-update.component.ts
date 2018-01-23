import { HostBinding, Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../services/organizacion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ICama } from '../../interfaces/ICama';

@Component({
    selector: 'cama-create-update',
    templateUrl: 'cama-create-update.html'
})
export class CamaCreateUpdateComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public organizacion: any;

    public cama: any = {
        sector: null,
        habitacion: null,
        numero: null,
        servicio: null,
        tipoCama: null,
        equipamiento: [], // falta definir
        ultimoEstado: null,
        paciente: null,
        idInternacion: null, // falta definir
        observaciones: null
    };

    constructor(
        public plex: Plex,
        public OrganizacionService: OrganizacionService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let id = params['id'];
            this.OrganizacionService.getById(id).subscribe(organizacion => {
                this.organizacion = organizacion;
                console.log(this.organizacion);
            });
        });
    }

    save() {
        this.cama.servicio = this.cama.servicio.concepto;
        let operacion = this.OrganizacionService.addCama(this.organizacion.id, this.cama);
        operacion.subscribe(result => {
            if (result) {
                this.plex.alert('Los datos se actualizaron correctamente');
                // this.data.emit(result);
            } else {
                this.plex.alert('ERROR: Ocurrio un problema al actualizar los datos');
            }
        });

    }
    cancel() {
        this.router.navigate(['/tm/organizacion']);
    }

    loadServicios($event) {
        let servicios = this.organizacion.servicios.map(elem => {
            return { id: elem.conceptId, nombre: elem.term, concepto: elem };
        });
        $event.callback(servicios);
    }
    loadEquipamientos() {
        /**
         * aca van los equipamientos ver si van a salir de un refset o de una query
         * Una vez definido armar el servicio para cargar el select
         */

    }

}
