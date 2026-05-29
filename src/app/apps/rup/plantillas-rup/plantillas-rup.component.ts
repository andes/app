import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Plex } from '@andes/plex';
import { PlantillasService } from '../../../modules/rup/services/plantillas.service';
import { ISnomedConcept } from '../../../modules/rup/interfaces/snomed-concept.interface';
import { SnomedService } from '../../mitos';
import { Unsubscribe } from '@andes/shared';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { PrestacionesService } from '../../../../app/modules/rup/services/prestaciones.service';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
@Component({
    selector: 'app-plantillas-rup',
    templateUrl: './plantillas-rup.component.html',
    styleUrls: [
        './plantillas-rup.component.scss',
        '../../../modules/rup/components/core/_rup.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class PlantillasRUPComponent implements OnInit, OnDestroy {

    searchTerm: string;
    busqueda: string;
    procedimientos: ISnomedConcept[];
    loading = false;

    procedimiento: ISnomedConcept;
    incluyeDescendientes = false;

    descendientes: ISnomedConcept[] = [];

    subject: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
    plantillas$: Observable<any> = this.subject.asObservable();
    mostrarDescendientes = false;

    public puedeCargarEditarPlantilla = false;
    private destroy$ = new Subject<void>();
    addItems = [
        {
            label: 'Plantilla',
            handler: ($event: Event) => {
                $event.stopPropagation();
                this.agregarPlantilla(this.procedimiento, false);
            }
        },
        {
            label: 'Enlace externo',
            handler: ($event: Event) => {
                $event.stopPropagation();
                this.agregarPlantilla(this.procedimiento, true);
            }
        }
    ];

    constructor(
        public plex: Plex,
        private sp: PlantillasService,
        private snomedService: SnomedService,
        public servicioPrestacion: PrestacionesService,
        private elementoRupService: ElementosRUPService,
        private router: Router,
        private auth: Auth
    ) { }

    ngOnInit() {
        this.puedeCargarEditarPlantilla = this.auth.check('rup:plantilla');
        // Si no tiene permiso, lo redirige al inicio.
        if (!this.puedeCargarEditarPlantilla) {
            this.redirect('inicio');
        }
        this.plex.updateTitle([{
            route: '/',
            name: 'ANDES'
        }, {
            route: '/rup',
            name: 'RUP'
        }, {
            name: 'Plantillas de Procedimientos'
        }]);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }
    addElementToObservableArray(item) {
        this.plantillas$.pipe(take(1)).subscribe(val => {

            let plantilla;

            if (!item.id) {
                plantilla = {
                    conceptos: [this.procedimiento],
                    descripcion: '',
                    title: '',
                    esSolicitud: false,
                    expression: `${this.procedimiento.conceptId}`,
                    esArchivoLink: item.esArchivoLink,
                    organizacion: item.organizacion
                };
            } else {
                plantilla = item;
            }

            const newArr = [plantilla, ...val];

            this.subject.next(newArr);
        });
    }

    removeElementFromObservableArray(idx) {
        this.plantillas$.pipe(take(1)).subscribe(val => {
            const arr = this.subject.getValue();
            arr.splice(idx, 1);
            this.subject.next(arr);
        });
    }

    clearArray() {
        this.plantillas$.pipe(take(1)).subscribe(val => {
            this.subject.next([]);
        });
    }

    @Unsubscribe()
    buscarProcedimiento() {
        // Validar que no esté vacío
        if (!this.searchTerm || !this.searchTerm.trim()) {
            this.procedimientos = [];
            this.loading = false;
            return;
        }

        // Evitar búsquedas con patrón inválido
        if (this.searchTerm.match(/<<\s{1,}/)) {
            this.searchTerm = '';
            this.procedimientos = [];
            this.loading = false;
            return;
        }

        // Evitar búsquedas concurrentes
        if (this.loading) {
            return;
        }

        this.loading = true;

        const query = {
            search: this.searchTerm.trim(),
            semanticTag: ['procedimiento', 'elemento de registro', 'régimen/tratamiento', 'situación', 'hallazgo', 'evento']
        };

        this.snomedService.get(query)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (resultado: ISnomedConcept[]) => {
                    this.procedimientos = resultado;
                    this.loading = false;

                    if (!resultado || resultado.length === 0) {
                        this.plex.info(
                            'warning',
                            `No se encontraron datos para: "${this.searchTerm.trim()}"`,
                            'Atención'
                        );
                    }
                },
                (error) => {
                    this.loading = false;
                    this.procedimientos = [];
                    this.plex.toast('danger', 'Error al buscar procedimientos', 'Error');
                }
            );
    }


    cargarPlantillas(procedimiento: any) {
        this.procedimiento = procedimiento;
        const elementoRUP = this.elementoRupService.buscarElemento(procedimiento);

        if (elementoRUP?.params?.habilitarPlantilla === false) {// null o true no ingresa
            this.addItems = [
                {
                    label: 'Enlace externo',
                    handler: ($event: Event) => {
                        $event.stopPropagation();
                        this.agregarPlantilla(this.procedimiento, true);
                    }
                }
            ];
        }
        this.subject.next([]);
        this.sp.get(procedimiento.conceptId, procedimiento.esSolicitud, true).subscribe(plantillas => {
            if (plantillas) {
                plantillas.forEach(x => {
                    if (x.id) {
                        this.addElementToObservableArray(x);
                    }
                });
            }
        });
    }

    guardarPlantilla(plantilla, conceptId) {
        let body;
        const expression = this.generarExpression(conceptId, this.incluyeDescendientes);
        if (typeof plantilla.id !== 'undefined') {
            plantilla['expression'] = expression;
            body = { plantilla, ...{ expression } }.plantilla;

            this.sp.patch(plantilla.id, body).subscribe(result => {
                if (result.id) {
                    this.cargarPlantillas(this.procedimiento);
                    this.plex.toast('success', 'Se guardó la plantilla correctamente', 'Plantilla RUP');
                }
            });
        } else {
            plantilla['expression'] = expression;
            body = { plantilla, ...{ expression }, ...{ conceptos: [this.procedimiento] } }.plantilla;
            this.sp.post(body).subscribe(result => {
                if (result.id) {
                    this.cargarPlantillas(this.procedimiento);
                    this.plex.toast('success', 'La plantilla se guardó correctamente', 'Plantillas RUP');
                }
            });
        }
    }

    generarExpression(conceptId: any, incluyeDescendientes: boolean) {
        return incluyeDescendientes ? `<<${conceptId}` : `${conceptId}`;
    }

    contieneDescendientes(expression) {
        return expression.indexOf('<<') === 0;
    }

    verDescendientes(procedimiento: ISnomedConcept) {
        this.snomedService.getQuery({ expression: `<<${procedimiento.conceptId}`, semanticTag: ['procedimiento'] }).subscribe(result => {
            this.descendientes = result;

            // TODO: Mensajes HTML más robustos desde PLEX?
            this.plex.info('info', result.map(x => {
                return `<small class="d-block w-100 text-capitalize text-left ">${x.term}</small>`;
            }).join(''),
            `Descendientes de ${this.procedimiento.term}`).then(infoResult => {
                this.mostrarDescendientes = false;
            });
        });
    }

    eliminarPlantilla(plantilla, idx) {
        if (plantilla.title || plantilla.descripcion) {
            this.plex.confirm(`Se eliminará la plantilla ${plantilla.title ? `"${plantilla.title}"` : ''}`, '¿Eliminar plantilla?', 'Eliminar', 'Cancelar').then(confirmar => {
                if (confirmar) {
                    if (plantilla.id) {
                        this.sp.delete(plantilla.id).subscribe(result => {
                            const listado = this.subject.getValue();

                            listado.splice(idx, 1);

                            this.subject.next(listado);
                            this.plex.toast('success', 'Título: ' + plantilla.title, 'Plantilla Eliminada');
                        });
                    } else {
                        this.removeElementFromObservableArray(idx);
                    }
                } else {
                    return false;
                }
            });
        } else {
            this.removeElementFromObservableArray(idx);
        }
    }

    agregarPlantilla(procedimiento: ISnomedConcept | null, esLink: boolean) {
        const miOrganizacion = this.auth.organizacion;
        const plantilla = {
            conceptos: [procedimiento],
            descripcion: '',
            title: '',
            link: '',
            esSolicitud: false,
            expression: `${procedimiento.conceptId}`,
            esArchivoLink: esLink,
            organizacion: esLink ? miOrganizacion : undefined
        };

        this.addElementToObservableArray(plantilla);
    }

    cerrarProcedimiento() {
        this.procedimiento = null;
        this.subject.next([]);
    }

    canDeletePlantilla(): boolean {
        return this.procedimiento?.conceptId !== '33633005';
    }

    get permiteSolicitud(): boolean {
        const tagsPermitidos = ['procedimiento', 'régimen/tratamiento', 'situación', 'hallazgo', 'evento'];
        return tagsPermitidos.includes(this.procedimiento?.semanticTag);
    }

}
