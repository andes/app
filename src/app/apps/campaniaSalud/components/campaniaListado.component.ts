import { Observable } from "rxjs/Observable";
import { CampaniaSaludService } from "../services/campaniaSalud.service";
import { Component, OnInit, EventEmitter, HostBinding } from "@angular/core";
import { Plex } from '@andes/plex';
import { ICampaniaSalud } from '../interfaces/ICampaniaSalud';

@Component({
    selector: 'campanias',
    templateUrl: 'campaniasListado.html'
    
})
export class CampaniaListadoComponent implements OnInit{
    public prueba:boolean=false;
    public campanias:any=[];
    public fechaDesde:Date;
    public fechaHasta:Date;
    
    constructor(public campaniaSaludService: CampaniaSaludService){

    }

    ngOnInit(){
        this.fechaDesde = moment().format('YYYY-MM-DD');
        this.fechaHasta = moment().format('YYYY-MM-DD');
        this.refreshSelection();
    }

    refreshSelection() {
        this.campaniaSaludService.getCampanias({
            "fechaDesde": this.fechaDesde,
            "fechaHasta": this.fechaHasta
        }).subscribe(res=>{
                this.campaniaSaludService.campanias = res;
                this.campanias = res;
        });
    }

    seleccionCampania(campania: ICampaniaSalud){
        this.campaniaSaludService.campaniaSeleccionada = campania;
    }

}