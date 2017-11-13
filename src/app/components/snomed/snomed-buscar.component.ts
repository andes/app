import { SemanticTag } from './../../modules/rup/interfaces/semantic-tag.type';
import { Component, OnInit, OnChanges, Output, Input, EventEmitter, ElementRef, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { SnomedService } from './../../services/term/snomed.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Observable } from 'rxjs/Rx';
import { FrecuentesProfesionalService } from './../../modules/rup/services/frecuentesProfesional.service';
import { TipoPrestacionService } from './../../services/tipoPrestacion.service';

@Component({
    selector: 'snomed-buscar',
    templateUrl: 'snomed-buscar.component.html',
    // creamos un handler para cuando se realiza un click
    host: {
        '(document:click)': 'handleClick($event)'
    },
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        'snomed-buscar.scss'
    ]
})

export class SnomedBuscarComponent implements OnInit, OnChanges {

    resultadosAux: any[] = [];
    @Input() arrayFrecuentes;
    // TODO: Agregar metodos faltantes, dragEnd() , dragStart() y poder vincularlos
    @Input() _draggable: Boolean = false;
    @Input() _dragScope: String;
    @Input() _dragOverClass: String = 'drag-over-border';
    // @Input() _dragData: String;

    // searchTermInput: Acá podemos enviarle como input un string
    // para que busque en SNOMED. ATENCION: al mandar este input se oculta
    // el text field para ingresar la busqueda a mano
    @Input() searchTermInput: String;

    // tipo de busqueda a realizar por: problemas / procedimientos /
    @Input() tipoBusqueda: String;
    // Outputs de los eventos drag start y drag end
    @Output() _onDragStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onDragEnd: EventEmitter<any> = new EventEmitter<any>();

    // output de informacion que devuelve el componente
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    @Output() tagBusqueda: EventEmitter<any> = new EventEmitter<any>();

    // Output de un boolean para indicar cuando se tienen resultados de
    // busqueda o no.
    @Output() _tengoResultado: EventEmitter<any> = new EventEmitter<any>();

    // cerrar si cliqueo fuera de los resultados
    // private closeListAfterClick: Boolean = false;
    private timeoutHandle: number;

    // En caso de querer ocultar el input de busqueda y solo utilizar el valor de searchTerm
    @Input() hideSearchInput: Boolean = false;

    // termino a buscar en SNOMED
    public searchTerm: String = '';

    // ocultar lista cuando no hay resultados
    public hideLista: Boolean = false;

    public resultados = [];
    public elementRef;

    // boolean para indicar si esta cargando o no
    public loading = false;
    public filtroActual = [];
    public esFiltroActual = false;

    private dragAndDrop = false;

    private cachePrestacionesTurneables = null;

    /*
    // Tipo de busqueda: hallazgos y trastornos / antecedentes / anteced. familiares
    public tipoBusqueda: String = '';
    */
    public contadorSemanticTags = {
        hallazgo: 0,
        trastorno: 0,
        procedimiento: 0,
        entidadObservable: 0,
        situacion: 0
    };

    // inyectamos servicio de snomed, plex y tambien ElementRef
    // ElementRef lo utilizo para tener informacion del
    // html del codigo de este componente en el DOM
    constructor(private SNOMED: SnomedService,
        private frecuentesProfesionalService: FrecuentesProfesionalService,
        private auth: Auth,
        private plex: Plex,
        myElement: ElementRef,
        public servicioTipoPrestacion: TipoPrestacionService) {
        this.elementRef = myElement;
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
        // this.hideSearchInput = true;

        // asignamos el texto a buscar
        this.searchTerm = this.searchTermInput;

        // falso easter egg :D
        if (this.searchTerm === 'ssssss') {
            console.log('sssssss 🐍 busssscando');
        }

        // ejecutamos busqueda por la serpiendte de snomed ... sssss &#128013;
        this.buscar();
    }

    dragStart(e) {
        this._onDragStart.emit(e);
    }

    dragEnd(e) {
        this._onDragEnd.emit(e);
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
                // this.timeoutHandle = null;
                this.loading = true;
                this.resultados = [];

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
                        this.loading = false;
                        this.resultados = resultados;


                        let frecuentes = [];

                        // Frecuentes de este profesional
                        this.frecuentesProfesionalService.getById(this.auth.profesional.id).subscribe(resultado => {
                            if (resultado && resultado[0] && resultado[0].frecuentes) {
                                frecuentes = resultado[0].frecuentes.map(x => {
                                    if (x.frecuencia != null && x.frecuencia >= 1 && this.resultados.find(c => c.conceptId === x.concepto.conceptId)) {
                                        this.resultados.splice(this.resultados.findIndex(r => r.conceptId === x.concepto.conceptId), 1);
                                        this.resultados.unshift(x.concepto);
                                    }
                                });
                            }

                        });
                        this.contadorSemantigTags(this.resultados);
                    }

                }, err => {
                    this.loading = false;
                    // this.plex.toast('error', 'No se pudo realizar la búsqueda', '', 5000);
                });

            }, 300);
        } else {
            this.resultados = [];
            this._tengoResultado.emit(false);
        }
    }

    contadorSemantigTags(resultados): any {

        this.contadorSemanticTags = {
            hallazgo: 0,
            trastorno: 0,
            procedimiento: 0,
            entidadObservable: 0,
            situacion: 0
        };

        let tag;

        resultados.forEach(x => {
            tag = x.semanticTag && x.semanticTag === 'entidad observable' ? 'entidadObservable' : x.semanticTag;
            this.contadorSemanticTags[String(tag)]++;
        });

    }

    filtroBuscadorSnomed(filtro: any[], tipo = null) {

        if (this.resultados.length >= this.resultadosAux.length) {
            this.resultadosAux = this.resultados;
        } else {
            this.resultados = this.resultadosAux;
        }

        this.resultados = this.resultadosAux.filter(x => filtro.find(y => y === x.semanticTag));
        this.tipoBusqueda = tipo ? tipo : '';
        this.filtroActual = tipo ? ['planes'] : filtro;
        this.esFiltroActual = this.getFiltroActual(filtro);
    }

    // TODOOOOOOO
    getFiltroActual(filtro: any[]) {
        return this.filtroActual.join('') === filtro.join('');
    }

    /**
     * Handler para cuando se ejecuta un click en el documento.
     * @param event  Click event
     * @returns      Void
     */
    handleClick(event): void {
        // buscamos que elemento fue clickeado
        let clickedComponent = event.target;

        // creamos una bandera para saber si pertenece a este componente
        let inside = false;

        // loopeamos
        do {
            // si hice click dentro del codigo html del componente
            // entonces indico que estoy adentro (inside = true)
            // y no oculto la lista de resultados
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;

                this.hideLista = false;
            }

            // info de que componente hice clic
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);

        // si no estamos en el componente, limpiamos lista de problemas
        if (!inside && !this._draggable) {
            this.resultados = [];
            this.hideLista = true;
            // this.searchTerm = '';
        }
    }

    // si hago clic en un concepto, entonces lo devuelvo
    seleccionarConcepto(concepto) {
        this.resultados = [];
        this.searchTerm = '';
        this.tagBusqueda.emit(this.filtroActual);
        this.evtData.emit(concepto);
    }

}
