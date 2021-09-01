import {
    Component, OnInit
} from '@angular/core';
import { RupElement } from '.';
import {
    RUPComponent
} from './../core/rup.component';
@Component({
    selector: 'rup-frecuencia-respiratoria',
    templateUrl: 'frecuenciaRespiratoria.html'
})
@RupElement('FrecuenciaRespiratoriaComponent')
export class FrecuenciaRespiratoriaComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        // Observa cuando cambia la propiedad 'frecuencia respiratoria' en otro elemento RUP
        if (!this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                // No soy yo mismo
                if (this.registro !== data && this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });
        }
    }

    getMensajes() {
        const mensaje: any = {
            texto: '',
            class: 'danger'
        };
        const Sexo = this.paciente.sexo;
        const Edad = this.paciente.edad;
        const frecuenciaRespiratoria = this.registro.valor;
        if (frecuenciaRespiratoria) {
            if (Edad <= 1) {
                if (frecuenciaRespiratoria >= 20 && frecuenciaRespiratoria <= 40) {
                    mensaje.texto = 'Dentro de los parámetros normales';
                } else {
                    mensaje.texto = 'Fuera de los parámetros normales';
                }
            }

            if (Edad > 1 && Edad <= 2) {
                if (frecuenciaRespiratoria >= 20 && frecuenciaRespiratoria <= 30) {
                    mensaje.texto = 'Dentro de los parámetros normales';
                } else {
                    mensaje.texto = 'Fuera de los parámetros normales';
                }
            }

            if (Edad > 2 && Edad <= 5) {
                if (frecuenciaRespiratoria >= 20 && frecuenciaRespiratoria <= 25) {
                    mensaje.texto = 'Dentro de los parámetros normales';
                } else {
                    mensaje.texto = 'Fuera de los parámetros normales';
                }
            }

            if (Edad > 5 && Edad <= 10) {
                if (frecuenciaRespiratoria >= 17 && frecuenciaRespiratoria <= 22) {
                    mensaje.texto = 'Dentro de los parámetros normales';
                } else {
                    mensaje.texto = 'Fuera de los parámetros normales';
                }
            }

            if (Edad > 10 && Edad <= 15) {
                if (frecuenciaRespiratoria >= 15 && frecuenciaRespiratoria <= 20) {
                    mensaje.texto = 'Dentro de los parámetros normales';
                } else {
                    mensaje.texto = 'Fuera de los parámetros normales';
                }
            }
            if (Edad > 15) {
                if (frecuenciaRespiratoria >= 12 && frecuenciaRespiratoria <= 20) {
                    mensaje.texto = 'Dentro de los parámetros normales';
                } else {
                    mensaje.texto = 'Fuera de los parámetros normales';
                }
            }
        }
        return mensaje;
    }
}
