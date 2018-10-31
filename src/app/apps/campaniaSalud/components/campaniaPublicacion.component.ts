import { ICampaniaSalud } from '../interfaces/ICampaniaSalud';
import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { CampaniaSaludComponent } from './campaniaSalud.component';
import { CampaniaSaludService } from "../services/campaniaSalud.service";

@Component({
    selector: 'campaniaSaludVisualizacion',
    templateUrl: 'campaniaVisualizacion.html'
    
})
export class CampaniaPublicacionComponent implements OnInit{
     @Input() campania: ICampaniaSalud;
     @Output() modificarOutput = new EventEmitter();

    constructor(public campaniaSaludService: CampaniaSaludService){}

    ngOnInit(){
        console.log(this.campania)
    }

    modificar(){
        this.modificarOutput.emit()
    }

}