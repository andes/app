import { CampaniaSaludService } from "./../services/campaniaSalud.service";
import { Component, OnInit, EventEmitter, HostBinding } from "@angular/core";
import { Plex } from '@andes/plex';
import { CampaniaSalud } from './campaniaSalud.component';

@Component({
    selector: 'campanias',
    templateUrl: 'campaniasListado.html'
    
})
export class CampaniaListadoComponent implements OnInit{
    public asunto:any;

    constructor(public campaniaSaludService: CampaniaSaludService){
        
    }

    ngOnInit(){
        this.asunto=this.campaniaSaludService.getAsunto().asunto;
    }
}