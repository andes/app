import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-prestar-hc',
    templateUrl: './prestar-hc.component.html'
})

export class PrestarHcComponent implements OnInit {
    // showPrestar = false;

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
