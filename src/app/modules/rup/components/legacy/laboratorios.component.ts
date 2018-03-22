import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

@Component({
    selector: 'lab',
    templateUrl: 'laboratorios.html',
    encapsulation: ViewEncapsulation.None,
})

export class LaboratoriosComponent implements OnInit {

    @Input() laboratorio: any = {};

    constructor() { }

    ngOnInit() {



    }
};
