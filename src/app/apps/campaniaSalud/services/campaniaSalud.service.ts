import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Server } from '@andes/shared';
import { CampaniaSalud } from '../components/campaniaSalud.component';

@Injectable()
export class CampaniaSaludService{
    campaniaSeleccionada: CampaniaSalud;
    campanias: CampaniaSalud;

    constructor(private server: Server){
        this.campaniaSeleccionada= new CampaniaSalud();
    } 

    getAsunto(){
        this.campanias = new CampaniaSalud();
        this.campanias.asunto="Probando";
        return this.campanias;
    }

}