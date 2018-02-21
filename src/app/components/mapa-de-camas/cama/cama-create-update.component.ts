import { HostBinding, EventEmitter, Component, OnInit, Input, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { CamasService } from '../../../services/camas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SnomedService } from '../../../services/term/snomed.service';
import { query } from '@angular/core/src/animation/dsl';
import { OrganizacionService } from '../../../services/organizacion.service';

@Component({
    selector: 'cama-create-update',
    templateUrl: 'cama-create-update.html'
})
export class CamaCreateUpdateComponent implements OnInit {
    @Input('idOrganizacion') idOrganizacion;
    @Input('camaSeleccion') camaSeleccion;
    @Output() showCama: EventEmitter<any> = new EventEmitter<any>();
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public organizacion: any;
    public unidadOrganizativa = null;

    public cama: any = {
        organizacion: null,
        sector: null,
        habitacion: null,
        nombre: null,
        tipoCama: null,
        equipamiento: [],
        estados: []
    };

    public estado = {
        fecha: new Date(),
        estado: 'desocupada',
        unidadOrganizativa: null,
        especialidades: null,
        esCensable: true,
        genero: null,
        paciente: null,
        idInternacion: null
    };

    constructor(
        public plex: Plex,
        public organizacionService: OrganizacionService,
        public CamaService: CamasService,
        private route: ActivatedRoute,
        private router: Router,
        public snomed: SnomedService
    ) { }

    ngOnInit() {
        this.organizacionService.getById(this.idOrganizacion).subscribe(organizacion => {
            this.organizacion = organizacion;
        });
    }

    save($event) {
        debugger;
        if ($event.formValid) {

            // cargamos el estado de la cama
            if (this.cama.estados && (this.cama.estados.length > 0)) {
                this.cama.estados.push(this.estado);
            } else {
                this.cama.estados = [this.estado];
            }

            this.cama.organizacion = {
                id: this.organizacion.id,
                _id: this.organizacion.id,
                nombre: this.organizacion.nombre
            };

            let operacion = this.CamaService.addCama(this.cama);
            operacion.subscribe(result => {
                if (result) {
                    this.plex.alert('La cama se creo correctamente');
                    this.showCama.emit(result);
                } else {
                    this.plex.alert('ERROR: Ocurrio un problema al crear la cama');
                }
            });
        }
    }

    cancel() {
        this.showCama.emit(false);
    }

    loadServicios($event) {
        let servicios = this.organizacion.servicios;
        $event.callback(servicios);
    }

    loadEspecialidades($event) {
        let servicios = this.organizacion.servicios;
        $event.callback(servicios);
    }

    loadGenero($event) {
        // buscamos los conceptos de genero femenino o masculino
        this.snomed.getQuery({ expression: '703118005 OR 703117000' }).subscribe(result => {
            $event.callback(result);
        });
    }

    loadTipoDeCama($event) {
        this.snomed.getQuery({ expression: '^2051000013106' }).subscribe(result => {
            $event.callback(result);
        });
    }

    loadEquipamientos($event) {
        this.snomed.getQuery({ expression: '^2061000013108' }).subscribe(result => {
            $event.callback(result);
        });
    }

}
