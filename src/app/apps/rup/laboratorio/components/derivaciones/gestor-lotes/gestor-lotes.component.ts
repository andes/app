import { ProtocoloService } from '../../../services/protocolo.service';
import { OnInit, Component } from '@angular/core';


@Component({
    selector: 'gestor-lotes',
    templateUrl: 'gestor-lotes.html'
})

export class GestorLotesComponent implements OnInit {
    accionIndex = 0;
    constructor(
        private protocoloService: ProtocoloService
    ) { }

    ngOnInit() {
    }
}

