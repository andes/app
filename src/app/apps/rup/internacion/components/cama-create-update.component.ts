import { HostBinding, EventEmitter, Component, OnInit, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { InternacionService } from '../services/internacion.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { CamasService } from '../services/camas.service';
import { SnomedService } from '../../../mitos';
import { Subject, of } from 'rxjs';
import { debounceTime, catchError } from 'rxjs/operators';

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
    public nuevaCama = true;
    public btnEliminar = '';

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
    public checkNombre = new Subject();
    public disabledSave = false;
    constructor(
        public plex: Plex,
        public organizacionService: OrganizacionService,
        public CamaService: CamasService,
        private route: ActivatedRoute,
        private authService: Auth,
        private router: Router,
        private auth: Auth,
        public snomed: SnomedService,
        private internacionService: InternacionService
    ) {


        this.checkNombre.pipe(debounceTime(1000)).subscribe(val => {
            this.validarNombre();
        });

    }

    ngOnInit() {
        this.organizacionService.getById(this.authService.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            this.sectores = this.organizacionService.getFlatTree(this.organizacion);
        });

        this.route.params.subscribe(params => {
            if (params && params['idCama']) {
                this.nuevaCama = false;
                let idCama = params['idCama'];
                this.CamaService.getCama(idCama).pipe(catchError(() => of(null))).subscribe(cama => {
                    this.cama = cama;
                    this.estado = Object.assign({}, this.cama.ultimoEstado);
                    if (this.controlEliminarCama()) {
                        this.btnEliminar = 'Eliminar cama';
                    } else {
                        this.btnEliminar = 'Dar de baja';
                    }
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

            // this.cama.sectores = this.sectores;
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
        if ($event.query) {
            let query = $event.query;
            let items = this.organizacionService.getFlatTree(this.organizacion);
            $event.callback(items);
        } else {
            if (this.cama.sectores && this.cama.sectores.length > 0) {
                $event.callback(this.cama.sectores);
            } else {
                $event.callback([]);
            }
        }

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

    controlEliminarCama() {
        if (this.cama && this.cama.id) {
            let estadosOcupada = this.cama.estados.filter(e => e.estado === 'ocupada');
            if (estadosOcupada && estadosOcupada.length) {
                return false;
            }
        }
        return true;
    }


    eliminarCama(cama) {
        if (this.controlEliminarCama()) {
            this.plex.confirm('Eliminar cama "' + cama.nombre + '"', '¿Desea eliminar?').then(confirmacion => {
                if (confirmacion) {
                    this.CamaService.eliminarCama(cama.id).subscribe(resultado => {
                        this.plex.info('info', 'La cama fue eliminada');
                        this.router.navigate(['/internacion/camas']);
                    });
                }
            });
        } else {
            if (this.cama.ultimoEstado.estado !== 'ocupada') {
                // vamos a actualizar el estado de la cama a inctivo
                let dto = {
                    fecha: new Date(),
                    estado: 'inactiva',
                    unidadOrganizativa: this.cama.ultimoEstado.unidadOrganizativa ? this.cama.ultimoEstado.unidadOrganizativa : null,
                    especialidades: this.cama.ultimoEstado.especialidades ? this.cama.ultimoEstado.especialidades : null,
                    esCensable: false,
                    genero: this.cama.ultimoEstado.genero ? this.cama.ultimoEstado.genero : null,
                    paciente: null,
                    idInternacion: null,
                    esMovimiento: false
                };
                this.CamaService.cambiaEstado(this.cama.id, dto).subscribe(camaActualizada => {
                    if (camaActualizada) {
                        this.plex.info('', 'La cama fue dada de baja');
                        this.router.navigate(['/internacion/camas']);
                    }

                }, (err1) => {
                    this.plex.info('danger', err1, 'Error al intentar dar de baja cama');
                });
            } else {
                this.plex.info('danger', 'No es posible dar de baja una cama ocupada');
                this.router.navigate(['/internacion/camas']);
            }
        }
    }

    checkAuth(permiso) {
        return this.auth.check('internacion:' + permiso);
    }

    validarNombre() {
        if (this.estado.unidadOrganizativa && this.estado.unidadOrganizativa.conceptId) {
            this.verificaDatos();
        }
    }

    verificaDatos() {
        if (this.estado.unidadOrganizativa) {
            this.CamaService.getCamas({ idOrganizacion: this.organizacion.id, unidadesOrganizativas: this.estado.unidadOrganizativa.conceptId }).subscribe(x => {
                const regex_nombre = new RegExp('.*' + this.cama.nombre + '.*', 'ig');
                let res = x.filter(cama => { return regex_nombre.test((cama.nombre as string)); });
                if (res.length > 0) {
                    this.plex.info('info', 'Ya existe una cama con este nombre');
                    this.disabledSave = true;
                } else {
                    this.disabledSave = false;
                }

            }
            );
        }
    }

}
