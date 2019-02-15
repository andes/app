import { Component, OnInit, OnChanges, Output, Input, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { SnomedService } from './../../services/term/snomed.service';
import { Unsubscribe } from '@andes/shared';

@Component({
    selector: 'snomed-buscar',
    templateUrl: 'snomed-buscar.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        'snomed-buscar.scss'
    ]
})

export class SnomedBuscarComponent implements OnInit, OnChanges {

    public conceptosTurneables: any[];
    // searchTermInput: Acá podemos enviarle como input un string
    // para que busque en SNOMED. ATENCION: al mandar este input se oculta
    // el text field para ingresar la busqueda a mano
    @Input() searchTermInput: String;
    // tipo de busqueda a realizar por: problemas / procedimientos /
    @Input() tipoBusqueda: String;
    // output de informacion que devuelve el componente
    // @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    // Output que devuelve los resultados de la busqueda
    @Output() onSearch: EventEmitter<any> = new EventEmitter<any>();

    @Input() autofocus: Boolean = true;

    // termino a buscar en SNOMED
    public searchTerm: String = '';
    public loading = false;

    constructor(
        private SNOMED: SnomedService,
        private plex: Plex
    ) {
    }

    ngOnInit() {
        if (this.searchTermInput) {
            this.busquedaManual();
        }
    }

    ngOnChanges(changes: any) {
        if (this.searchTermInput) {
            // this.busquedaManual();
        }
    }

    // iniciar busqueda es un metodo creado para poder buscar cuando
    // ejecuto alguna acción en base al Input() _searchTerm
    // (que viene desde otro componente)
    // Si ese Input() no viene definido usa uno propio este componente
    busquedaManual() {
        this.searchTerm = this.searchTermInput;
        this.buscar();
    }

    /**
     * Buscar trastornos o hallazgos en el servicio de SNOMED
     * @param event  change event en el input buscar
     * @returns      Void
     */
    @Unsubscribe()
    buscar(): void {
        if (this.searchTerm && this.searchTerm !== '') {

            if (this.searchTerm.match(/^\s{1,}/)) {
                this.searchTerm = '';
                return;
            }

            let search = this.searchTerm.trim();

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
                        semanticTag: ['producto', 'objeto físico', 'medicamento clínico']
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
                        search: search,
                        semanticTag: ['hallazgo', 'trastorno', 'procedimiento', 'entidad observable', 'producto', 'situación', 'régimen/tratamiento', 'elemento de registro', 'objeto físico', 'medicamento clínico', 'evento']
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
