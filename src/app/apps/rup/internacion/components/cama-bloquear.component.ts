import { Component, OnInit, Input } from '@angular/core';
import { ICama } from '../interfaces/ICama';

@Component({
    selector: 'cama-bloquear',
    templateUrl: 'cama-bloquear.html'
})
export class CamaBloquearComponent implements OnInit {
    @Input() cama: ICama;
    // lista de los motivos del bloque, luego los va a traer desde snomed
    public listaMotivosBloqueo = [{ id: 'Bolqueo', name: 'Bloqueo' }, { id: 'Falta de personal', name: 'Falta de personal' }, { id: 'Se envia a reparar', name: 'Se envia a reparar' }];


    ngOnInit() {

    }

}
