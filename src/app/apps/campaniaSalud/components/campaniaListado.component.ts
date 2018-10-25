import { CampaniaSaludService } from "./../services/campaniaSalud.service";
import { Component, OnInit, EventEmitter, HostBinding } from "@angular/core";
import { Plex } from '@andes/plex';
import { ICampaniaSalud } from '../interfaces/ICampaniaSalud';

@Component({
    selector: 'campanias',
    templateUrl: 'campaniasListado.html'
    
})
export class CampaniaListadoComponent implements OnInit{
    public asunto:any;
    public prueba:boolean=false;
    campanias:any;

    constructor(public campaniaSaludService: CampaniaSaludService){
    }

    ngOnInit(){
        this.campaniaSaludService.getCampanias().subscribe(res=>{
            this.campanias=res;
        });
    }

}