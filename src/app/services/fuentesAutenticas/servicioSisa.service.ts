import { matchSisa } from '../../../../../api/utils/servicioSisa';
import { PacienteService } from '../paciente.service';
import * as https from 'https';
import { Injectable } from '@angular/core';


@Injectable()
export class SisaService {
    // servicioMatchSisa era el nombre de la clase
    ValidarPacienteEnSisa(paciente) {
        // Esta condición es para obtener todos los pacientes que no tengan la entidadValidadora "Sisa" o bien el campo no exista.
        return new Promise((resolve, reject) => {
            try {
                matchSisa(paciente).then(res => {
                    if (res) {
                        console.log('RES ----', res);
                        resolve(res);
                    }
                });
            } catch (err) {
                console.log('Error catch:', err);
                reject('error');
            };

        });
    }
}
