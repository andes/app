import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { IFinanciador } from './../interfaces/IFinanciador';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FinanciadorService {
  private financiadorUrl = '/core/tm/financiadores';  // URL to web api

  constructor(private server: Server) { }

  get(): Observable<IFinanciador[]> {
    return this.server.get(this.financiadorUrl);
  }
}
