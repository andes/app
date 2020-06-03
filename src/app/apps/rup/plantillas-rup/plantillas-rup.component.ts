import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { PlantillasService } from '../../../modules/rup/services/plantillas.service';
import { ISnomedConcept } from '../../../modules/rup/interfaces/snomed-concept.interface';
import { SnomedService } from '../../mitos';
import { Unsubscribe } from '@andes/shared';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { PrestacionesService } from '../../../../app/modules/rup/services/prestaciones.service';
@Component({
    selector: 'app-plantillas-rup',
    templateUrl: './plantillas-rup.component.html',
    styleUrls: [
        './plantillas-rup.component.scss',
        '../../../modules/rup/components/core/_rup.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class PlantillasRUPComponent implements OnInit {

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

    constructor(
        public plex: Plex,
        private sp: PlantillasService,
        private snomedService: SnomedService,
        public servicioPrestacion: PrestacionesService) { }

    ngOnInit() {
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

        if (this.searchTerm.match(/<<\s{1,}/)) {
            this.searchTerm = '';
            return;
        }

        let search = this.searchTerm.trim();

        let query = {
            search: this.searchTerm,
            semanticTag: ['procedimiento', 'elemento de registro', 'régimen/tratamiento']

        };


        this.snomedService.get(query).subscribe((resultado: ISnomedConcept[]) => {
            this.procedimientos = resultado;
        });
    }


    cargarPlantillas(procedimiento) {

        this.procedimiento = procedimiento;
        this.subject.next([]);
        this.sp.get(procedimiento.conceptId, procedimiento.esSolicitud).subscribe(plantillas => {

            if (plantillas) {
                plantillas.forEach(x => {
                    if (x.id) {
                        this.addElementToObservableArray(x);
                    }
                });
            } else {
                this.addElementToObservableArray({});
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

    verDescendientes(procedimiento) {
        this.snomedService.getQuery({ expression: `<<${procedimiento.conceptId}`, semanticTag: ['procedimiento'] }).subscribe(result => {
            this.descendientes = result;

            // TODO: Mensajes HTML más robustos desde PLEX?
            this.plex.info('info', result.map(x => { return `<small class="d-block w-100 text-capitalize text-left ">${x.term}</small>`; }).join(''),
                `Descendientes de ${this.procedimiento.term}`).then(infoResult => {
                    this.mostrarDescendientes = false;
                });
        });
    }

    guardarPlantillas() {
        this.plantillas$.map(pl => {
            this.guardarPlantilla(pl, this.procedimiento.conceptId);
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

    agregarPlantilla(procedimiento) {
        const plantilla = {
            conceptos: [procedimiento],
            descripcion: '',
            title: '',
            esSolicitud: false,
            expression: `${procedimiento.conceptId}`
        };

        this.addElementToObservableArray(plantilla);
    }

    cerrarProcedimiento() {
        this.procedimiento = null;
        this.subject.next([]);
    }
}
