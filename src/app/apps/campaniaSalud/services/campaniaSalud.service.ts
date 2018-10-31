import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { ICampaniaSalud } from '../interfaces/ICampaniaSalud';
import { Observable } from 'rxjs';

@Injectable()
export class CampaniaSaludService{
    campaniaSeleccionada: ICampaniaSalud;
    campanias: ICampaniaSalud[];
    readonly campaniaUrl="/core/tm/campanias";
    
    constructor(private server: Server){
    } 

    getCampanias(params?):Observable<ICampaniaSalud[]>{
        return this.server.get(this.campaniaUrl,{params: params});
    }
    putCampanias(campania:ICampaniaSalud){
        return this.server.put(this.campaniaUrl + '/' + campania.id, campania);
    }
    postCampanias(campania:ICampaniaSalud){
        console.log('log this', campania);
        return this.server.post(this.campaniaUrl, campania);
    }
}