import { Observable } from "rxjs/Observable";
import { CampaniaSaludService } from "./../services/campaniaSalud.service";
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
        this.fechaDesde = moment().startOf('day');
        this.fechaHasta = moment().endOf('day');
        this.campaniaSaludService.getCampanias().subscribe(res=>{
            this.campanias=res;
        });
    }

    refreshSelection() {
        this.campanias = [];
        this.cargarCampanias();
    }

    cargarCampanias() {
        this.campaniaSaludService.getCampanias({
            "fechaDesde": this.fechaDesde,
            "fechaHasta": this.fechaHasta
        }).subscribe(res=>{
                this.campaniaSaludService.campanias = res;
                this.campanias = res;
                console.log("res:" + res.toString);
                console.log(res);
        });
        console.log("campañas del listado");
        console.log(this.campanias);
        console.log("campañas del servicio");
        console.log(this.campaniaSaludService.campanias);
    }

}