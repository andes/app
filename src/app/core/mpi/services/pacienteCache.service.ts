import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { IPaciente } from '../interfaces/IPaciente';
@Injectable()
export class PacienteCacheService {

    private pacienteCache = new BehaviorSubject<any>(null);
    private isScannedCache = new BehaviorSubject<any>(null);

    setPaciente(paciente: IPaciente) {
        this.pacienteCache.next(paciente);
    }

    getPacienteValor(): IPaciente {
        return this.pacienteCache.value;
    }

    getPaciente(): Observable<any> {
        return this.pacienteCache.asObservable();
    }

    clearPaciente() {
        this.pacienteCache.next(null);
    }

    setScanCode(scan: string) {
        this.isScannedCache.next(scan);
    }

    getScan(): string {
        return this.isScannedCache.value;
    }

    clearScanState() {
        this.isScannedCache.next(null);
    }
}
