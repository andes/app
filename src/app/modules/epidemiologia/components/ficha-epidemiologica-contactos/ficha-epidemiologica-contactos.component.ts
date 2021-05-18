import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-ficha-epidemiologica-contactos',
    templateUrl: './ficha-epidemiologica-contactos.component.html'
})
export class FichaEpidemiologicaContactosComponent implements OnInit {
    @Input() contactos: any;
    @Output() volver = new EventEmitter<any>();

    constructor(
        private plex: Plex,
    ) { }

    ngOnInit() { }
}
