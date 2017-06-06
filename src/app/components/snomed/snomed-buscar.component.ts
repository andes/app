import { Component, OnInit, OnChanges, Output, Input, EventEmitter, ElementRef, SimpleChanges } from '@angular/core';
import { SnomedService } from './../../services/snomed.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

import { Observable } from 'rxjs/Rx';

@Component({
    selector: 'snomed-buscar',
    templateUrl: 'snomed-buscar.component.html',
    // creamos un handler para cuando se realiza un click
    host: {
        '(document:click)': 'handleClick($event)'
    },
    styles: [`
    .results {
        margin-top: 0;
    }
    
    .results.list-group>.list-group-item {
        padding: 5px;
        cursor: -webkit-grab;
    }`
    ]
})

export class SnomedBuscarComponent implements OnInit, OnChanges {
    // TODO: Agregar metodos faltantes, dragEnd() , dragStart() y poder vincularlos
    @Input() _draggable: Boolean = false;
    @Input() _dragScope: String;
    @Input() _dragOverClass: String = 'drag-over-border';
    // @Input() _dragData: String;
    @Input() searchTermInput: String;

    // methods
    @Output() _onDragStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onDragEnd: EventEmitter<any> = new EventEmitter<any>();


    // [dragScope]="'problemas-paciente'" [dragOverClass]="'drag-over-border'" [dragData]="problemaMaestro"  
    // (onDragEnd)="arrastrandoProblema(false)" (onDragStart)="arrastrandoProblema(true)"

    // cerrar si cliqueo fuera de los resultados
    // private closeListAfterClick: Boolean = false;
    private timeoutHandle: number;
    private hideSearchInput: Boolean = false;

    public hideLista: Boolean = false;
    public listaProblemasMaestro = [];
    public elementRef;

    public loading = false;
    public searchTerm: String = '';
    public tipoBusqueda: String = '';

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    constructor(private SNOMED: SnomedService, private plex: Plex,
        myElement: ElementRef) {
        this.elementRef = myElement;
    }

    ngOnInit() {
        // si paso como un Input el string a buscar
        // entonces oculto el text input del formulario
        if (this.searchTermInput) {
            // iniciar busqueda manual
            this.busquedaManual();
        }
     }

     ngOnChanges(changes: any) {
        this.busquedaManual();
    }

    // iniciar busqueda es un metodo creado para poder buscar cuando
    // ejecuto alguna acción en base al Input() _searchTerm
    // (que viene desde otro componente)
    // Si ese Input() no viene definido usa uno propio este componente
    busquedaManual() {
        this.hideSearchInput = true;

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

    setTipoBusqueda(tipoBusqueda): void {
        // seteamos el tipo de busqueda que deseamos realizar
        this.tipoBusqueda = tipoBusqueda;

        // buscamos por la serpiente de SNOMED
        this.buscar();
    }

    /**
     * Buscar trastornos o hallazgos en el servicio de SNOMED
     * @param event  change event en el input buscar
     * @returns      Void
     */
    buscar(): void {
        // console.log($e);
        // if ($e.keyCode === 'Escape') {
        //     this.listaProblemasMaestro = [];
        // //     return false;
        // }

        // Cancela la búsqueda anterior
        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
        }

        if (this.searchTerm) {
            // levantamos el valor que escribimos en el input
            let search = this.searchTerm.trim();

            // armamos query para enviar al servicio
            let query = {
                search: search,
                tipo: this.tipoBusqueda
            };

            // seteamos un timeout de 3 segundos luego que termino de escribir
            // para poder realizar la busqueda
            this.timeoutHandle = window.setTimeout(() => {
                this.timeoutHandle = null;
                this.loading = true;
                this.listaProblemasMaestro = [];

                // buscamos
                //this.SNOMED.buscarTrastornosHallazgos(search).subscribe(problemas => {
                this.SNOMED.get(query).subscribe(problemas => {
                    this.loading = false;
                    this.listaProblemasMaestro = problemas;

                }, err => {
                    this.loading = false;
                    // this.plex.toast('error', 'No se pudo realizar la búsqueda', '', 5000);
                });

            }, 300);
        } else {
            this.listaProblemasMaestro = [];
        }
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
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;

                this.hideLista = false;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);

        // si no estamos en el componente, limpiamos lista de problemas
        if (!inside && !this._draggable) {
            // this.listaProblemasMaestro = [];
            this.hideLista = true;
        }
    }

    seleccionarConcepto(concepto) {
        this.evtData.emit(concepto);
    }
}
