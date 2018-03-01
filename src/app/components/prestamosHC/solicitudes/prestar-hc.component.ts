import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-prestar-hc',
    templateUrl: './prestar-hc.component.html'
})

export class PrestarHcComponent implements OnInit {
    @Input() prestar: any;

    prestarHC: any = {
        destino: '',
        responsable: '',
        observaciones: ''
    }

    ngOnInit() {
        this.prestarHC.destino = this.prestar.datosPrestamo.turno.espacioFisico[0].nombre;
        this.prestarHC.responsable = this.prestar.datosPrestamo.turno.profesional[0][0].apellido + ' ' + this.prestar.datosPrestamo.turno.profesional[0][0].apellido;
        debugger;
    }

    save(event) {
debugger;
    }

    cancel() {

    }
}
