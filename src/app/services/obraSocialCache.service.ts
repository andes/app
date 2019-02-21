import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IFinanciador } from '../interfaces/IFinanciador';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ObraSocialCacheService {
    private financiadorPacienteCache = new BehaviorSubject(null);
    constructor() { }
    /**
     * Obtiene los datos de la obra social asociada a un paciente
     */

    getFinanciadorPacienteCache(): Observable<IFinanciador[]> {
        return this.financiadorPacienteCache.asObservable();
    }

    setFinanciadorPacienteCache(financiadores) {
        this.financiadorPacienteCache.next(financiadores);
    }

}
