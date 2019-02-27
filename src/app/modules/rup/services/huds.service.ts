import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class HUDSService {
    private _registrosHUDS = [];
    private _obsRegistros = new BehaviorSubject<any[]>([]);

    public registrosHUDS = this._obsRegistros.asObservable();

    constructor() { }

    public addRegistro (registro) {
        this._registrosHUDS.push(registro);
        this._obsRegistros.next(this._registrosHUDS);
    }
}
