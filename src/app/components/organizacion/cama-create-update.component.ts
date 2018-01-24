import { HostBinding, EventEmitter, Component, OnInit, Input, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../services/organizacion.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'cama-create-update',
    templateUrl: 'cama-create-update.html'
})
export class CamaCreateUpdateComponent implements OnInit {
    @Input('idOrganizacion') idOrganizacion;
    @Input('camaSeleccion') camaSeleccion;
    @Output() showCama: EventEmitter < boolean > = new EventEmitter < boolean > ();
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
        this.OrganizacionService.getById(this.idOrganizacion).subscribe(organizacion => {
            this.organizacion = organizacion;
        });
        if (this.camaSeleccion) {
            this.cama = this.camaSeleccion;
            this.cama.servicio = {
                id: this.cama.servicio.conceptId,
                nombre: this.cama.servicio.term,
                concepto: this.cama.servicio
            };
            // guardar el id de la cama para hacer el patch
            // si tengo id de cama es un patch si no un Post de una cama.
            // si es edicion crear el servicio para pegarle a la API.
        }
    }

    save($event) {
        if ($event.formValid) {
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

    }

    cancel() {
        this.showCama.emit(false);
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
