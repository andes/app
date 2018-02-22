import { Component, Input, OnInit, EventEmitter, Output, ViewEncapsulation, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { EdadPipe } from './../../../pipes/edad.pipe';
import { Auth } from '@andes/auth';
import { ArancelamientoService } from './../../../services/arancelamiento.service';

@Component({
    selector: 'arancelamiento-form',
    templateUrl: 'arancelamiento-form.html',
    styleUrls: ['arancelamiento-form.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})


export class ArancelamientoFormComponent implements OnInit {

    turnoSeleccionado: any;
    efector = this.auth.organizacion.nombre;
    obraSocial: string;
    codigoOs: string;
    showForm = false;
    @Input('turno')
    set turno(value: any) {
        this.turnoSeleccionado = value;
    }
    get turno(): any {
        return this.turnoSeleccionado;
    }

    @Output() volverAPuntoInicio: EventEmitter<any> = new EventEmitter<any>();
    @HostBinding('class.plex-layout') layout = true;

    constructor(public auth: Auth, public servicioArancelamiento: ArancelamientoService, public plex: Plex) { }

    ngOnInit() {
        this.servicioArancelamiento.get(this.turnoSeleccionado.paciente.documento).subscribe(resultado => {
            this.obraSocial = resultado.nombre;
            this.codigoOs = resultado.codigo;
            this.showForm = true;
        });
    }

    cancelar() {
        this.volverAPuntoInicio.emit();
    }

    imprimir() {
        window.print();
    }
}
