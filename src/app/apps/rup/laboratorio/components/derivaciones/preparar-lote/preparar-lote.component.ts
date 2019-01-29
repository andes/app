import { ProtocoloService } from '../../../services/protocolo.service';
import { OnInit, Component } from '@angular/core';



@Component({
    selector: 'preparar-lote',
    templateUrl: 'preparar-lote.html',
    styleUrls: ['../../../assets/laboratorio.scss']
})

export class PrepararLoteComponent implements OnInit {
    area;
    desde;
    hasta;
    organizacionDestino;
    practicas;
    estado;

    constructor(
        private protocoloService: ProtocoloService
    ) { }

    ngOnInit() {
    }

    buscar($event, x?) {
        console.log($event, x);
    }
}

