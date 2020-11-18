import { Auth } from '@andes/auth';
import { Injectable } from '@angular/core';
import { MapaCamasService } from './mapa-camas.service';

@Injectable()
export class PermisosMapaCamasService {

    public camaCreate = false;
    public camaEdit = false;
    public camaBaja = false;
    public salaCreate = false;
    public salaEdit = false;
    public salaDelete = false;
    public ingreso = false;
    public movimientos = false;
    public egreso = false;
    public bloqueo = false;
    public censo = false;
    public descargarListado = false;

    constructor(
        private auth: Auth,
        private mapaCamasService: MapaCamasService,
    ) {
        const ambito = this.mapaCamasService.ambito;
        this.camaCreate = this.auth.check(`${ambito}:cama:create`);
        this.camaEdit = this.auth.check(`${ambito}:cama:edit`);
        this.camaBaja = this.auth.check(`${ambito}:cama:baja`);
        this.salaCreate = this.auth.check(`${ambito}:sala:create`);
        this.salaEdit = this.auth.check(`${ambito}:sala:edit`);
        this.salaDelete = this.auth.check(`${ambito}:salaDelete`);
        this.ingreso = this.auth.check(`${ambito}:ingreso`);
        this.movimientos = this.auth.check(`${ambito}:movimientos`);
        this.egreso = this.auth.check(`${ambito}:egreso`);
        this.bloqueo = this.auth.check(`${ambito}:bloqueo`);
        this.censo = this.auth.check(`${ambito}:censo`);
        this.descargarListado = this.auth.check(`${ambito}:descargarListado`);
    }
}
