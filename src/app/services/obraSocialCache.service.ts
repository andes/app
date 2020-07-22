import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { IObraSocial } from '../interfaces/IObraSocial';

@Injectable()
export class ObraSocialCacheService {
    private financiadorPacienteCache = new BehaviorSubject(null);
    constructor(private server: Server) { }
    /**
     * Obtiene los datos de la obra social asociada a un paciente
     */

    getFinanciadorPacienteCache(): Observable<IObraSocial> {
        return this.financiadorPacienteCache.asObservable();
    }

    setFinanciadorPacienteCache(financiadores) {
        this.financiadorPacienteCache.next(financiadores);
    }

}
