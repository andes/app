import {
    Component, OnInit, OnChanges, Output, Input,
    EventEmitter, ElementRef, SimpleChanges,
    ViewEncapsulation, ContentChildren, OnDestroy
} from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ISubscription } from 'rxjs/Subscription';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Cie10Service } from '../../../../services/term/cie10.service';

@Component({
    selector: 'buscador-cie10',
    templateUrl: 'buscador-cie10.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        'buscador-cie10.scss'
    ]
})

export class BuscadorCie10Component implements OnInit, OnDestroy {

    // Output que devuelve los resultados de la busqueda
    @Output() seleccionEmit: EventEmitter<any> = new EventEmitter<any>();

    private timeoutHandle: number;

    // En caso de querer ocultar el input de busqueda y solo utilizar el valor de searchTerm
    @Input() autofocus: Boolean = true;

    // termino a buscar
    public searchTerm: String = '';

    // ocultar lista
    public hideLista: Boolean = true;

    // lista de resultados
    public resultados;

    private cachePrestacionesTurneables = null;

    // ultima request que se almacena con el subscribe
    private lastRequest: ISubscription;

    constructor(
        private auth: Auth,
        private plex: Plex,
        private servicioCie10: Cie10Service
    ) {
    }

    /* limpiamos la request que se haya ejecutado */
    ngOnDestroy() {
        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }
    }

    ngOnInit() {
    }

    /**
     * Buscar conceptos cie10
     * @param event  change event en el input buscar
     * @returns      Void
     */
    buscar(): void {
        // Cancela la búsqueda anterior
        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
        }

        if (this.searchTerm && this.searchTerm !== '') {

            if (this.searchTerm.match(/^\s{1,}/)) {
                this.searchTerm = '';
                return;
            };

            // levantamos el valor que escribimos en el input
            // let search = this.searchTerm.trim();

            // armamos query para enviar al servicio
            let query = {
                nombre: this.searchTerm,
                limit: 10
            };

            // seteamos un timeout de 3 segundos luego que termino de escribir
            // para poder realizar la busqueda
            this.timeoutHandle = window.setTimeout(() => {

                // buscamos

                let idTimeOut = this.timeoutHandle;

                if (this.lastRequest) {
                    this.lastRequest.unsubscribe();
                }

                this.lastRequest = this.servicioCie10.get(query).subscribe(results => {

                    if (idTimeOut === this.timeoutHandle) {
                        // Para evitar que se oculte la lista de resultados
                        this.resultados = results;
                        this.hideLista = false;
                    }

                }, err => {
                    this.plex.toast('error', 'No se pudo realizar la búsqueda', '', 5000);
                });

            }, 600);
        } else {
            // cancelamos ultimo request
            if (this.lastRequest) {
                this.lastRequest.unsubscribe();
            }
        }
    }

    seleccionarPrestacion(item) {
        this.hideLista = true;
        this.seleccionEmit.emit(item);
        this.searchTerm = '';
    }
}
