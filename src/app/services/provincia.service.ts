import { IProvincia } from './../interfaces/IProvincia';
import { Injectable } from '@angular/core';
import { Server} from '@andes/shared';
import {Observable} from 'rxjs/Rx';
import { environment } from '../../environments/environment';

@Injectable()
export class ProvinciaService {

   private provinciaUrl = '/core/tm/provincias';  // URL to web api

   constructor(private server: Server) {}

   get(params: any): Observable<IProvincia[]> {
        return this.server.get(this.provinciaUrl, {params: params, showError: true});
   }
}
