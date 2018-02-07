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
    // con esta query de snomed trae todos los tipos de cama.
    private expression = '<<229772003';
    public cama: any = {
        organizacion: null,
        sector: null,
        habitacion: null,
        numero: null,
        unidadesOrganizativas: null,
        tipoCama: null,
        equipamiento: [], // falta definir
        esCensable: true,
        ultimoEstado: {
            estado: 'desocupada',
            paciente: null,
            idInternacion: null, // Falta definir
            observaciones: null
        }
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
        if ($event.formValid) {
            this.cama.organizacion = {
                id: this.organizacion.id,
                _id: this.organizacion.id,
                nombre: this.organizacion.nombre
            };
            if (this.unidadOrganizativa) {
                // this.cama.servicio = this.cama.servicio.concepto;
                this.cama.unidadesOrganizativas = [{
                    fecha: new Date(),
                    esPrestamo: false,
                    unidadOrganizativa: this.unidadOrganizativa,
                    observaciones: null
                }];
            }

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

    loadTipoDeCama($event) {
        this.snomed.getQuery({ expression: this.expression }).subscribe(result => {
            $event.callback(result);
        });
    }

    loadEquipamientos() {
        /**
         * aca van los equipamientos ver si van a salir de un refset o de una query
         * Una vez definido armar el servicio para cargar el select
         */

    }

}
