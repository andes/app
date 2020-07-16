import { OnInit, Component, Input } from '@angular/core';

@Component({
    selector: 'seguimientoCovid',
    templateUrl: 'seguimientoCovid.html'

})

export class SeguimientoCovidComponent implements OnInit {
    private _casos;
    @Input('casos')
    set casos(value: any) {
        this._casos = value;
    }
    get casos(): any {
        return this._casos;
    }

    ngOnInit() {
    }
}
