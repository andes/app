import { HostBinding, EventEmitter, Component, OnInit, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

import { SnomedService } from '../../../../../../services/term/snomed.service';
import { OrganizacionService } from '../../../../../../services/organizacion.service';
import { CamasService } from '../../../../services/camas.service';
import { InternacionService } from '../../../../services/internacion.service';

@Component({
    selector: 'cama-create-update',
    templateUrl: 'cama-create-update.html',
    styleUrls: ['cama-create-update.scss']
})
export class CamaCreateUpdateComponent implements OnInit {
    @Input() idOrganizacion;
    @Input() camaSeleccion;
    @Output() showCama: EventEmitter<any> = new EventEmitter<any>();
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public organizacion: any;
    public unidadOrganizativa = null;
    public sectores: any[] = [];

    public cama: any = {
        organizacion: null,
        sectores: [],
        nombre: null,
        tipoCama: null,
        equipamiento: [],
        estados: []
    };

    public estado: any = {
        fecha: new Date(),
        estado: 'desocupada',
        unidadOrganizativa: null,
        especialidades: null,
        esCensable: true,
        genero: null,
        paciente: null,
        idInternacion: null,
        esMovimiento: false
    };

    constructor(
        public plex: Plex,
        public organizacionService: OrganizacionService,
        public CamaService: CamasService,
        private route: ActivatedRoute,
        private authService: Auth,
        private router: Router,
        public snomed: SnomedService,
        private internacionService: InternacionService
    ) { }

    ngOnInit() {
        this.organizacionService.getById(this.authService.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
        });

        this.route.params.subscribe(params => {
            if (params && params['idCama']) {
                let idCama = params['idCama'];
                this.CamaService.getCama(idCama).subscribe(cama => {
                    this.cama = cama;
                    this.sectores = this.cama.sectores;
                    this.estado = Object.assign({}, this.cama.ultimoEstado);
                    this.organizacionService.getById(this.cama.organizacion.id).subscribe(organizacion => {
                        this.organizacion = organizacion;
                    });
                });
            }
        });
    }

    onSelectItem($event) {
        this.sectores = $event;
    }

    save($event) {
        if ($event.formValid) {
            // cargamos el estado de la cama
            if (this.cama.estados && (this.cama.estados.length > 0)) {
                if (JSON.stringify(this.cama.ultimoEstado) !== JSON.stringify(this.estado)) {
                    this.cama.ultimoEstado = JSON.stringify(this.estado);
                    this.estado.esMovimiento = false;
                    this.cama.estados.push(this.estado);
                }
            } else {
                // si la organizacion no usa el workflow completo el estado inicial es disponible
                if (!this.internacionService.usaWorkflowCompleto(this.organizacion.id)) {
                    this.estado.estado = 'disponible';
                }
                this.cama.estados = [this.estado];
            }

            this.cama.organizacion = {
                id: this.organizacion.id,
                _id: this.organizacion.id,
                nombre: this.organizacion.nombre
            };

            this.cama.sectores = this.sectores;
            let operacion = this.CamaService.addCama(this.cama);
            operacion.subscribe(result => {
                if (result) {
                    if (this.cama.id) {
                        this.router.navigate(['/internacion/camas']);
                    } else {
                        this.router.navigate(['/internacion/camas']);
                    }

                } else {
                    this.plex.info('warning', 'ERROR: Ocurrio un problema al crear la cama');
                }
            });
        }
    }

    cancel() {
        this.router.navigate(['/internacion/camas']);
    }

    onSectorSelect($event, org) {
        this.sectores = this.organizacionService.getRuta(org, $event.value);
    }

    loadSectores($event) {
        let query = $event.query;
        let items = this.organizacionService.getFlatTree(this.organizacion);
        $event.callback(items);
    }

    loadServicios($event) {
        this.snomed.getQuery({ expression: '<<284548004' }).subscribe(result => {
            $event.callback(result);
        });
    }

    loadEspecialidades($event) {
        this.snomed.getQuery({ expression: '<<394733009' }).subscribe(result => {
            $event.callback(result);
        });
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
