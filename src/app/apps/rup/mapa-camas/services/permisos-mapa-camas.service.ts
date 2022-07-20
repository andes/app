import { Auth } from '@andes/auth';
import { Injectable } from '@angular/core';
import { MapaCamasService } from './mapa-camas.service';

@Injectable()
export class PermisosMapaCamasService {

    private ambito;
    public camaCreate = false;
    public camaEdit = false;
    public camaBaja = false;
    public camaPrestamo = false;
    public salaCreate = false;
    public salaEdit = false;
    public salaDelete = false;
    public ingreso = false;
    public movimientos = false;
    public egreso = false;
    public bloqueo = false;
    public censo = false;
    public descargarListado = false;
    public registros = false;
    public indicacionesVer;
    public indicacionesCrear;
    public indicacionesEjecutar;
    public indicacionesValidar;

    constructor(
        private auth: Auth,
    ) { }

    setAmbito(ambito) {
        this.ambito = ambito;
        this.calcularPermisos();
    }

    calcularPermisos() {
        this.camaCreate = this.auth.check(`${this.ambito}:cama:create`);
        this.camaEdit = this.auth.check(`${this.ambito}:cama:edit`);
        this.camaBaja = this.auth.check(`${this.ambito}:cama:baja`);
        this.camaPrestamo = this.auth.check(`${this.ambito}:cama:prestamo`);
        this.salaCreate = this.auth.check(`${this.ambito}:sala:create`);
        this.salaEdit = this.auth.check(`${this.ambito}:sala:edit`);
        this.salaDelete = this.auth.check(`${this.ambito}:salaDelete`);
        this.ingreso = this.auth.check(`${this.ambito}:ingreso`);
        this.movimientos = this.auth.check(`${this.ambito}:movimientos`);
        this.egreso = this.auth.check(`${this.ambito}:egreso`);
        this.bloqueo = this.auth.check(`${this.ambito}:bloqueo`);
        this.censo = this.auth.check(`${this.ambito}:censo`);
        this.descargarListado = this.auth.check(`${this.ambito}:descargarListado`);
        this.indicacionesVer = this.auth.check(`${this.ambito}:indicaciones`);
        this.indicacionesCrear = this.auth.check(`${this.ambito}:indicaciones:create`);
        this.indicacionesEjecutar = this.auth.check(`${this.ambito}:indicaciones:ejecutar`);
        this.indicacionesValidar = this.auth.check(`${this.ambito}:indicaciones:validar`);
        this.registros = this.auth.check('internacion:registros');
    }
}
