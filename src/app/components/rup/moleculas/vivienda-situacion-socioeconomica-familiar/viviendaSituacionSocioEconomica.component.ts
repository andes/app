import { Molecula } from './../../core/molecula.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../../interfaces/IPaciente";
import { TipoPrestacionService } from "../../../../services/tipoPrestacion.service";
@Component({
    selector: 'rup-ViviendaSituacionSocioEconomica',
    templateUrl: 'viviendaSituacionSocioEconomica.html'
})
export class ViviendaSituacionSocioEconomicaComponent extends Molecula {
}