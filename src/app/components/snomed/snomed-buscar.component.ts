import { Component, OnInit, Output, Input, EventEmitter, ViewEncapsulation, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { SnomedService } from '../../apps/mitos';
import { Unsubscribe } from '@andes/shared';
import { SnomedBuscarService } from './snomed-buscar.service';

@Component({
    selector: 'snomed-buscar',
    templateUrl: 'snomed-buscar.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        'snomed-buscar.scss'
    ]
})

export class SnomedBuscarComponent implements OnInit, OnDestroy {
    @Input() tipoBusqueda: String;
    @Input() autofocus: Boolean = true;
    expression: string = null;

    @Output() onSearch: EventEmitter<any> = new EventEmitter<any>();

    public searchTerm: String = '';
    public loading = false;
    private _suscribe = null;

    constructor(
        private SNOMED: SnomedService,
        private plex: Plex,
        private buscadorService: SnomedBuscarService
    ) {
    }

    ngOnInit() {
        this._suscribe = this.buscadorService.onChange.subscribe((data) => {
            this.searchTerm = data.term;
            this.expression = data.expression;
            this.buscar();
        });
    }

    ngOnDestroy() {
        this._suscribe.unsubscribe();
    }

    /**
     * Buscar trastornos o hallazgos en el servicio de SNOMED
     * @param event  change event en el input buscar
     * @returns      Void
     */
    @Unsubscribe()
    buscar(): void {
        if (this.searchTerm && this.searchTerm !== '' || this.expression) {

            if (this.searchTerm.match(/^\s{1,}/)) {
                this.searchTerm = '';
                return;
            }

            const search = this.searchTerm.trim();

            this.loading = true;
            // buscamos
            let apiMethod;

            switch (this.tipoBusqueda) {
                case 'problemas':
                    apiMethod = this.SNOMED.get({
                        search: search,
                        semanticTag: ['hallazgo', 'trastorno', 'situación', 'evento']
                    });
                    break;
                case 'procedimientos':
                    apiMethod = this.SNOMED.get({
                        search: search,
                        semanticTag: ['procedimiento', 'entidad observable', 'régimen/tratamiento']
                    });
                    break;
                case 'planes':
                    apiMethod = this.SNOMED.get({
                        search: search,
                        semanticTag: ['procedimiento', 'régimen/tratamiento']
                    });
                    break;
                case 'productos':
                    apiMethod = this.SNOMED.get({
                        search: search,
                        semanticTag: ['producto', 'objeto físico', 'medicamento clínico', 'fármaco de uso clínico']
                    });
                    break;
                case 'equipamientos':
                    apiMethod = this.SNOMED.get({
                        search: search,
                        semanticTag: ['objeto físico']
                    });
                    break;
                default:
                    apiMethod = this.SNOMED.get({
                        expression: this.expression || undefined,
                        search: search,
                        semanticTag: ['hallazgo', 'trastorno', 'procedimiento', 'entidad observable', 'producto', 'situación', 'régimen/tratamiento', 'elemento de registro', 'objeto físico', 'medicamento clínico', 'fármaco de uso clínico', 'evento']
                    });
                    break;
            }

            return apiMethod.subscribe(resultados => {
                this.loading = false;
                this.onSearch.emit(this.formatearResultados(resultados));
            }, err => {
                this.loading = false;
                this.plex.toast('error', 'No se pudo realizar la búsqueda', '', 5000);
            });


        } else {
            this.loading = false;
            this.onSearch.emit(this.formatearResultados());
        }
    }

    /**
     * Creamos un objeto de resultados a devolver que contiene 'term' que es el string con el que busco
     * y despues 'items' que es un array de resultados de conceptos de SNOMED
     *
     * @param {any} resultados Array de resultados de SNOMED
     * @returns Object
     * @memberof SnomedBuscarComponent
     */
    formatearResultados(resultados = []) {
        return {
            term: this.searchTerm,
            items: resultados,
        };
    }
}
