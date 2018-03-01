import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-prestar-hc',
    templateUrl: './prestar-hc.component.html'
})

export class PrestarHcComponent implements OnInit {
    // showPrestar = false;

    @Input() carpeta : any;

    prestarHC: any = {
        destino: '',
        responsable: '',
        observaciones: ''
    }

    ngOnInit() {

    }

    save(event) {
        event.     
    }

    cancel() {

    }
}
