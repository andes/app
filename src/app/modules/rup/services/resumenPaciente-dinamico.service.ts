import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { HUDSService } from '../services/huds.service';

@Injectable()
export class ResumenPacienteDinamicoService {

    private resumenURL = '/modules/rup/prestaciones'; // URL to web api
    private consultaPrincipal = '<<410620009'; // conceptId de niño sano
    private conceptosBuscados = [
        { titulo: 'Peso en Kgs.', conceptId: '<<27113001' }, // peso
        { titulo: 'PC. Peso', conceptId: '170005003' }, // percentilo peso del niño
        { titulo: 'Talla en cm.', conceptId: '<<50373000 OR 14456009' }, // talla
        { titulo: 'PC. Talla', conceptId: '248338008' }, // percentilo de talla
        { titulo: 'IMC', conceptId: '60621009' }, // imc
        { titulo: 'PC. IMC', conceptId: '446974000' }, // percentilo imc
        { titulo: 'Perim. Cef.', conceptId: '363812007' }, // perimetro cefalico
        { titulo: 'PC. Perim. Cef.', conceptId: '248397001' }, // percentilo perim cefalico
        { titulo: 'Tensión arterial', conceptId: '46973005' }, // presion arterial
        { titulo: 'Lactancia materna', conceptId: '3658006' }, // lactancia
        { titulo: 'Desarrollo psicomotor', conceptId: '65401001' } // desarrollo psicomotor
    ];

    constructor(private server: Server, private hudsService: HUDSService) { }

    /**
     * Devuelve todas las prestaciones de un paciente en las que se encuentren los conceptos (y/o hijos) especificados
     * en la tabla 'conceptosBuscados'.
     * @param idPaciente : String.
     * Además se especifica la expresion de la consulta a filtrar y un arreglo con los conceptos buscados.
     */
    get(idPaciente: String): Observable<any[]> {
        const params = { consultaPrincipal: this.consultaPrincipal, hudsToken: this.hudsService.getHudsToken(), conceptos: JSON.stringify(this.conceptosBuscados) };
        return this.server.get(this.resumenURL + '/resumenPaciente/' + idPaciente, { params: params, showError: true });
    }
}
