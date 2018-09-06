import { Plex } from '@andes/plex';
import { Component, HostBinding } from '@angular/core';
import { IPracticaMatch } from '../interfaces/IPracticaMatch.inteface';
import { PracticaBuscarResultado } from '../interfaces/PracticaBuscarResultado.inteface';
import { IPractica } from '../../../interfaces/laboratorio/IPractica';

@Component({
    templateUrl: 'demoPractica.html',

})
export class PracticaDemoComponent {
    @HostBinding('class.plex-layout') layout = true;

    public practicas: IPracticaMatch[] | IPractica[];
    public practicaActiva: IPractica;


    constructor(private plex: Plex) { }

    searchStart() {
        this.practicas = null;
    }

    searchEnd(resultado: PracticaBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.practicas = resultado.practicas;
        }
    }

    searchClear() {
        this.practicas = null;
    }

    seleccionarPractica(practica: IPractica) {
        this.practicaActiva = practica;
    }

    hoverPractica(practica: IPractica) {
        this.practicaActiva = practica;
    }
}
