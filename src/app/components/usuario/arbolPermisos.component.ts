import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'arbolPermisos',
    templateUrl: 'arbolPermisos.html'
})

export class ArbolPermisosComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    @Input() item: any;

    constructor(private plex: Plex) { }

    public ngOnInit() {

    }

}
