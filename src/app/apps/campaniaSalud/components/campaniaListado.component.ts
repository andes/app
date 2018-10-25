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
    public asunto:string;
    public prueba:boolean=false;
    public seleccion:any=[];
    public campanias:any=[];
    public fechaDesde:Date;
    public fechaHasta:Date;

    constructor(public campaniaSaludService: CampaniaSaludService){
        // this.listado = [
        //     {
        //         id: 1,
        //         fechaDesde: 'Mon Feb 14 2018 11:15:52 GMT-0300 (ART)',
        //         fechaHasta: 'Mon Feb 20 2018 11:15:52 GMT-0300 (ART)',
        //         asunto: 'Cáncer',
        //         cuerpo: 'Si sos mujer de ...',
        //         estado: "Oculto"
        //     },
        //     {
        //         id: 2,
        //         fechaDesde: 'Mon Feb 16 2018 11:15:52 GMT-0300 (ART)',
        //         fechaHasta: 'Mon Feb 20 2018 11:15:52 GMT-0300 (ART)',
        //         asunto: 'Fumador',
        //         cuerpo: 'Si fumas ...',
        //         estado: "Publicado"
        //     }
        // ];
        this.asunto="";
        this.fechaDesde=null;
        this.fechaHasta=null;
    }

    ngOnInit(){
        this.campaniaSaludService.getCampanias({}).subscribe(res=>{
            this.campanias=res;
        });
    }

    refreshSelection() {
        this.seleccion = [];
        this.cargarCampanias();
    }

    cargarCampanias() {
        this.campaniaSaludService.getCampanias({
            "fechaDesde": this.fechaDesde,
            "fechaHasta": this.fechaHasta,
            "asunto": this.asunto
        }).subscribe(res=>{
                this.campaniaSaludService.campanias = res;
        });
    }

}