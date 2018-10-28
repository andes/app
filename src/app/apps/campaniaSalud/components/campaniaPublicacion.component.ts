import { ICampaniaSalud } from '../interfaces/ICampaniaSalud';
import { Component } from '@angular/core'; //TODO agregar a app.module

@Component({
    selector: 'campaniaSaludPublicacion',
    templateUrl: 'campaniaPublicacion.html'
    
})

export class CampaniaPublicacionComponent implements ICampaniaSalud{
    asunto:string;
    cuerpo:string;
    link:string;
    imagen:string;
    sexo:string;
    edadDesde:Number;
    edadHasta: Number;
    fechaDesde:Date;
    fechaHasta:Date;
    estado:string;
}