import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';

@Component({
    selector: 'busquedaUsuario',
    templateUrl: 'busquedaUsuario.html',
    //   styleUrls: ['busquedaUsuario.css']
})

export class BusquedaUsuarioComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    ngOnInit() {

    }
}
