import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { IPais } from './../interfaces/IPais';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class PaisService {

   private paisUrl = environment.API +'/core/tm/paises';  // URL to web api

   constructor(private server: Server) {}

   get(): Observable<IPais[]> {
       return this.server.get(this.paisUrl);
   }
}
