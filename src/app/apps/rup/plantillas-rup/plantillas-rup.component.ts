import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { PlantillasService } from '../../../modules/rup/services/plantillas.service';
import { ISnomedConcept } from '../../../modules/rup/interfaces/snomed-concept.interface';
import { SnomedService } from '../../../services/term/snomed.service';
import { Unsubscribe } from '@andes/shared';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-plantillas-rup',
    templateUrl: './plantillas-rup.component.html',
    styleUrls: [
        './plantillas-rup.component.scss',
        '../../../modules/rup/components/core/_rup.scss'
    ]
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
        private snomedService: SnomedService) { }

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
            semanticTag: ['procedimiento']
        }
        this.snomedService.get(query).subscribe((resultado: ISnomedConcept[]) => {
            this.procedimientos = resultado;
        });
    }


    cargarPlantillas(procedimiento) {
        this.procedimiento = procedimiento;
        this.sp.get(procedimiento.conceptId).subscribe(plantillas => {

            if (plantillas) {
                plantillas.filter(x => typeof x.handler !== 'function').map(y => {
                    this.addElementToObservableArray(y);
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
                    this.plex.toast('success', 'Se guardó la plantilla correctamente', 'Plantillas RUP');
                }
            });
        }
    }

    generarExpression(conceptId: any, incluyeDescendientes: boolean) {
        // console.log(incluyeDescendientes ? `<<${conceptId}` : `${conceptId}`);
        return incluyeDescendientes ? `<<${conceptId}` : `${conceptId}`;
    }

    contieneDescendientes(expression) {
        return expression.indexOf('<<') === 0;
    }

    verDescendientes(procedimiento) {
        // debugger;
        this.mostrarDescendientes = true;
        this.snomedService.getQuery({ expression: `<<${procedimiento.conceptId}`, semanticTag: ['procedimiento'] }).subscribe(result => {
            this.descendientes = result;
            this.plex.info('info', result.map(x => { return `<small class="d-block w-100 text-capitalize text-left ">${x.term}</small>`; }).join(''),
                `Descendientes de ${this.procedimiento.term}`).then(infoResult => {
                    this.mostrarDescendientes = false;
                });
        });
    }

    guardarPlantillas() {
        this.plantillas$.map(pl => {
            // console.log(pl);
            this.guardarPlantilla(pl, this.procedimiento.conceptId);
        });
    }

    eliminarPlantilla(plantilla, idx) {
        if (plantilla.title || plantilla.descripcion) {
            this.plex.confirm(`Se eliminará la plantilla ${plantilla.title ? `"${plantilla.title}"` : ''}`, '¿Eliminar plantilla?', 'Eliminar', 'Cancelar').then(confirmar => {
                if (confirmar) {
                    if (plantilla.id) {
                        this.sp.delete(plantilla.id).subscribe(result => {
                            this.subject.next(result);
                            this.plex.toast('success', 'Título: ' + plantilla.title, 'Plantilla Eliminada')
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
            expression: `${procedimiento.conceptId}`
        };

        this.addElementToObservableArray(plantilla);
    }

    // actualizarEstado(idPlantilla) {
    //     const idx = this.botones.findIndex(x => x === idPlantilla);
    //     this.botones.splice(idx, 1);
    // }

    cerrarProcedimiento() {
        this.procedimiento = null;
    }
}
