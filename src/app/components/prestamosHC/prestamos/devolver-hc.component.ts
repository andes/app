import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-devolver-hc',
    templateUrl: './devolver-hc.component.html'
})

export class DevolverHcComponent implements OnInit {
    prestarHC: any = {
        destino: '',
        responsable: '',
        observaciones: ''
    }

    ngOnInit() {

    }

    save(event) {

    }

    cancel() {

    }
}