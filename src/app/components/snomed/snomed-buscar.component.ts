import { element } from 'protractor';
import { PrestacionesService } from './../../modules/rup/services/prestaciones.service';
import { SemanticTag } from './../../modules/rup/interfaces/semantic-tag.type';
import { Component, OnInit, OnChanges, Output, Input, EventEmitter, ElementRef, SimpleChanges, ViewEncapsulation, ContentChildren } from '@angular/core';
import { SnomedService } from './../../services/term/snomed.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs/Rx';
import { FrecuentesProfesionalService } from './../../modules/rup/services/frecuentesProfesional.service';
import { TipoPrestacionService } from './../../services/tipoPrestacion.service';
import { log } from 'util';

@Component({
    selector: 'snomed-buscar',
    templateUrl: 'snomed-buscar.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        'snomed-buscar.scss'
    ]
})

export class SnomedBuscarComponent implements OnInit, OnChanges {

    resultadosAux: any[] = [];
    // searchTermInput: Acá podemos enviarle como input un string
    // para que busque en SNOMED. ATENCION: al mandar este input se oculta
    // el text field para ingresar la busqueda a mano
    @Input() searchTermInput: String;
    // tipo de busqueda a realizar por: problemas / procedimientos /
    @Input() tipoBusqueda: String;
    // output de informacion que devuelve el componente
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    // Output que devuelve los resultados de la busqueda
    @Output() _resultados: EventEmitter<any> = new EventEmitter<any>();

    // TODO _tengoResultado y loadin no son lo mismo???

    // Output de un boolean para indicar cuando se tienen resultados de
    // busqueda o no.
    @Output() _tengoResultado: EventEmitter<any> = new EventEmitter<any>();
    // boolean para indicar si esta cargando o no
    @Output() loading: EventEmitter<any> = new EventEmitter<any>();

    private timeoutHandle: number;

    // En caso de querer ocultar el input de busqueda y solo utilizar el valor de searchTerm
    @Input() hideSearchInput: Boolean = false;

    // termino a buscar en SNOMED
    public searchTerm: String = '';

    // ocultar lista cuando no hay resultados
    public hideLista: Boolean = false;

    private cachePrestacionesTurneables = null;

    // inyectamos servicio de snomed y plex
    constructor(private SNOMED: SnomedService,
        private frecuentesProfesionalService: FrecuentesProfesionalService,
        private auth: Auth,
        private plex: Plex,
        public servicioTipoPrestacion: TipoPrestacionService,
        public servicioPrestacion: PrestacionesService) {
    }

    ngOnInit() {
        // si paso como un Input el string a buscar mediante la variable searchTermInput
        // entonces oculto el text input del formulario
        if (this.searchTermInput) {
            // iniciar busqueda manual
            this.busquedaManual();
        }

        // Trae las prestaciones turneables y la guarda en memoria para luego
        // filtrar los resultados de las busquedas
        this.iniciarPrestacionesTurneables();
    }

    iniciarPrestacionesTurneables() {
        if (!this.cachePrestacionesTurneables) {
            this.servicioTipoPrestacion.get({}).subscribe(tiposPrestacion => {
                this.cachePrestacionesTurneables = tiposPrestacion;
            });
        }
    }

    ngOnChanges(changes: any) {
        // si paso como un Input el string a buscar mediante la variable searchTermInput
        // y hubo algun cambio, entonces ejecuto la busqueda manual
        if (this.searchTermInput) {
            this.busquedaManual();
        }
    }

    // iniciar busqueda es un metodo creado para poder buscar cuando
    // ejecuto alguna acción en base al Input() _searchTerm
    // (que viene desde otro componente)
    // Si ese Input() no viene definido usa uno propio este componente
    busquedaManual() {
        // ocultamos el campo input para buscar

        // asignamos el texto a buscar
        this.searchTerm = this.searchTermInput;

        // falso easter egg :D
        if (this.searchTerm === 'ssssss') {
            console.log('sssssss 🐍 busssscando');
        }

        // ejecutamos busqueda por la serpiendte de snomed ... sssss &#128013;
        this.buscar();
    }

    /**
     * Buscar trastornos o hallazgos en el servicio de SNOMED
     * @param event  change event en el input buscar
     * @returns      Void
     */
    buscar(): void {
        // if ($e.keyCode === 'Escape') {
        //     this.resultados = [];
        // //     return false;
        // }

        if (this.tipoBusqueda !== 'equipamientos') {
            this.iniciarPrestacionesTurneables();
        }

        // Cancela la búsqueda anterior
        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
        }

        if (this.searchTerm && this.searchTerm !== '') {

            if (this.tipoBusqueda !== 'equipamientos') {
                this._tengoResultado.emit(true);
            }

            // levantamos el valor que escribimos en el input
            let search = this.searchTerm.trim();

            // armamos query para enviar al servicio
            let query = {
                search: search
                // tipo: this.tipoBusqueda
            };

            // seteamos un timeout de 3 segundos luego que termino de escribir
            // para poder realizar la busqueda
            this.timeoutHandle = window.setTimeout(() => {
                this.loading.emit(true);
                // buscamos
                let apiMethod;

                switch (this.tipoBusqueda) {
                    case 'problemas':
                        apiMethod = this.SNOMED.get({
                            search: search,
                            semanticTag: ['hallazgo', 'trastorno', 'situación']
                        });
                        break;
                    case 'procedimientos':
                        apiMethod = this.SNOMED.get({
                            search: search,
                            semanticTag: ['procedimiento', 'entidad observable']
                        });
                        break;
                    case 'planes':
                        apiMethod = this.SNOMED.get({
                            search: search,
                            semanticTag: ['procedimiento']
                        });
                        break;
                    case 'productos':
                        apiMethod = this.SNOMED.get({
                            search: search,
                            semanticTag: ['producto']
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
                            semanticTag: ['hallazgo', 'trastorno', 'procedimiento', 'entidad observable', 'situación']
                        });
                        break;
                }

                let idTimeOut = this.timeoutHandle;

                apiMethod.subscribe(resultados => {

                    if (idTimeOut === this.timeoutHandle) {

                        // Para evitar que se oculte la lista de resultados
                        this.loading.emit(false);
                        this._resultados.emit(resultados);
                    }

                }, err => {
                    this.loading.emit(false);
                    this.plex.toast('error', 'No se pudo realizar la búsqueda', '', 5000);
                });

            }, 300);
        } else {
            this._tengoResultado.emit(false);
        }
    }

}
