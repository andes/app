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
        return (params)? this.server.get(this.campaniaUrl + 'Filtros', { params: params, showError: true })
                       : this.server.get(this.campaniaUrl);
    }
    putCampanias(_id){
        return this.server.put(this.campaniaUrl + '/_id', this.campaniaSeleccionada);
    }
    postCampanias(campania:ICampaniaSalud){
        return this.server.post(this.campaniaUrl, campania);
    }

}