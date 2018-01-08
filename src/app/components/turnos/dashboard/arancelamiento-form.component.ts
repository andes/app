import { Component, Input, OnInit, EventEmitter, Output, ViewEncapsulation, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { EdadPipe } from './../../../pipes/edad.pipe';
import { Auth } from '@andes/auth';


@Component({
    selector: 'arancelamiento-form',
    templateUrl: 'arancelamiento-form.html',
    styleUrls: ['arancelamiento-form.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})


export class ArancelamientoFormComponent implements OnInit {

    turnoSeleccionado: any;
    efector = this.auth.organizacion.nombre;
    @Input('turno')
    set turno(value: any) {
        this.turnoSeleccionado = value;
    }
    get turno(): any {
        return this.turnoSeleccionado;
    }

    @Output() volverAPuntoInicio: EventEmitter<any> = new EventEmitter<any>();
    @HostBinding('class.plex-layout') layout = true;

    constructor(public auth: Auth) { }

    ngOnInit() {
    }

    cancelar() {
        this.volverAPuntoInicio.emit();
    }

    imprimir() {
        window.print();
    }
}
