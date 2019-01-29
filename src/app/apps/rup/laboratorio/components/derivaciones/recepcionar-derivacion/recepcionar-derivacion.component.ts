import { ProtocoloService } from './../../../services/protocolo.service';
import { OnInit, Component } from '@angular/core';


@Component({
    selector: 'recepcionar-derivacion',
    templateUrl: 'recepcionar-derivacion.html'
})

export class RecepcionarDerivacionesComponent implements OnInit {
    accionIndex = 0;
    constructor(
        private protocoloService: ProtocoloService
    ) { }

    ngOnInit() {
    }

    onTabChange($event) {
        console.log('onTabChange', $event);
    }

    buscar($event) {
        if ($event.value && $event.value.length >= 3) {
            this.protocoloService.searchByNumeroProcolo($event.value).subscribe( (result) => {
                console.log('result', result);
            });
        }
    }
}

