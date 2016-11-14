import { PlexService } from 'andes-plex/src/lib/core/service';
import { Component } from '@angular/core';

@Component({
    templateUrl: 'espacio-fisico-create.html',
})

export class EspacioFisicoComponent {
    public modelo: any = {};

    ngOnInit() {
        this.modelo = { nombre: "" };
    }

}