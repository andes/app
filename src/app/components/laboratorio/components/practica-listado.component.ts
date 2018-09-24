import { IPracticaMatch } from '../interfaces/IPracticaMatch.inteface';
import { IPractica } from '../../../interfaces/laboratorio/IPractica';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    selector: 'practica-listado',
    templateUrl: 'practica-listado.html'
})
export class PracticaListadoComponent {
    private _practicas: IPracticaMatch[] | IPractica[];
    public seleccionada: IPracticaMatch | IPractica;

    // Propiedades públicas
    public listado: IPractica[]; // Contiene un listado  de practicas

    @Input()
    get practicas(): IPracticaMatch[] | IPractica[] {
        return this._practicas;
    }

    set practicas(value: IPracticaMatch[] | IPractica[]) {

        this._practicas = value;
        if (value && value.length) {
            if ('practica' in value[0]) {
                this.listado = (value as IPracticaMatch[]).map(i => i.practica);
            } else {
                this.listado = value as IPractica[];
            }
            console.log('LISTADO', this.listado);
        } else {
            this.listado = [];
        }

    }
    @Input() autoselect = true;
    /**
       * Evento que se emite cuando se selecciona una practica
       *
       * @type {EventEmitter<IPractica>}
       */
    @Output() selected: EventEmitter<IPractica> = new EventEmitter<IPractica>();
    /**
     * Evento que se emite cuando el mouse está sobre una practica
     * @type {EventEmitter<any>}
     * @memberof PracticaListadoComponent
     */
    @Output() hover: EventEmitter<IPractica> = new EventEmitter<IPractica>();


    constructor(private plex: Plex) {
    }

    public seleccionar(practica: IPractica) {


        if (this.seleccionada !== practica) {
            this.seleccionada = practica;
            this.selected.emit(this.seleccionada);
        }

    }

    public hoverPractica(practica: IPractica) {
        this.hover.emit(practica);
    }
}
