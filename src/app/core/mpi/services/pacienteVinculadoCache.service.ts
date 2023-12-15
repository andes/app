import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { IPaciente } from '../interfaces/IPaciente';
@Injectable()
export class PacienteVinculadoCacheService {

    private pacienteVinculadoCache = new BehaviorSubject<any>(null);
    private isScannedCache = new BehaviorSubject<any>(null);

    setPaciente(paciente: IPaciente) {
        this.pacienteVinculadoCache.next(paciente);
    }

    getPacienteValor(): IPaciente {
        return this.pacienteVinculadoCache.value;
    }

    getPaciente(): Observable<any> {
        return this.pacienteVinculadoCache.asObservable();
    }

    clearPaciente() {
        this.pacienteVinculadoCache.next(null);
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
