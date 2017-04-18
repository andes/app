import { Atomo } from './../atomoComponent';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from "../../../../interfaces/IPaciente";
@Component({
    selector: 'rup-ViviendaNivelInstruccion',
    templateUrl: 'viviendaNivelInstruccion.html'
})
export class ViviendaNivelInstruccionComponent extends Atomo{         
    public SelectNivel: Array<Object> = [{ id: 'Primario Completo', nombre: 'Primario Completo' },
    { id: 'Secundario Completo', nombre: 'Secundario Completo' },
    { id: 'Terciario/Universitario', nombre: 'Terciario/Universitario' },
    ];
}