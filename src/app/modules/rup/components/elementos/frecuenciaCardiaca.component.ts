import { RUPComponent } from './../core/rup.component';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'rup-frecuencia-cardiaca',
    templateUrl: 'frecuenciaCardiaca.html'
})
export class FrecuenciaCardiacaComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        // Observa cuando cambia la propiedad 'frecuencia cardicaca' en otro elemento RUP
        this.conceptObserverService.observe(this.registro).subscribe((data) => {
            // No soy yo mismo
            if (this.registro !== data && this.registro.valor !== data.valor) {
                this.registro.valor = data.valor;
                this.emitChange(false);
            }
        });
    }


    // getMensajes() {
    //     let Edad;
    //     let Sexo;
    //     let frecuenciaCardiaca;
    //     let mensaje: any = {
    //         texto: '',
    //         class: 'danger'
    //     };

    //     Sexo = this.paciente.sexo;
    //     Edad = 20; // this.paciente.edad; //Solo es para probar!!
    //     frecuenciaCardiaca = this.data[this.elementoRUP.key];

    //     if (frecuenciaCardiaca) {
    //         if (Sexo === 'masculino') {
    //             if (Edad >= 20 && Edad <= 29) {
    //                 if (frecuenciaCardiaca < 86) {
    //                     mensaje.texto = 'Inadecuado';
    //                 }
    //                 if (frecuenciaCardiaca <= 62 && frecuenciaCardiaca >= 68) {
    //                     mensaje.texto = 'Buena';
    //                 }
    //                 if (frecuenciaCardiaca >= 60) {
    //                     mensaje.texto = 'excelente';
    //                 }
    //             }
    //             if (Edad >= 30 && Edad <= 39) {
    //                 if (frecuenciaCardiaca < 86) {
    //                     mensaje.texto = 'Inadecuado';
    //                 }
    //                 if (frecuenciaCardiaca <= 64 && frecuenciaCardiaca >= 70) {
    //                     mensaje.texto = 'Buena';
    //                 }
    //                 if (frecuenciaCardiaca >= 62) {
    //                     mensaje.texto = 'excelente';
    //                 }
    //             }
    //             if (Edad >= 50) {
    //                 if (frecuenciaCardiaca < 90) {
    //                     mensaje.texto = 'Inadecuado';
    //                 }
    //                 if (frecuenciaCardiaca <= 68 && frecuenciaCardiaca >= 74) {
    //                     mensaje.texto = 'Buena';
    //                 }
    //                 if (frecuenciaCardiaca >= 66) {
    //                     mensaje.texto = 'excelente';
    //                 }
    //             }
    //         }
    //         if (Sexo === 'femenino') {
    //             if (Edad >= 20 && Edad <= 29) {
    //                 if (frecuenciaCardiaca < 96) {
    //                     mensaje.texto = 'Inadecuado';
    //                 }
    //                 if (frecuenciaCardiaca <= 72 && frecuenciaCardiaca >= 76) {
    //                     mensaje.texto = 'Buena';
    //                 }
    //                 if (frecuenciaCardiaca >= 70) {
    //                     mensaje.texto = 'excelente';
    //                 }
    //             }
    //             if (Edad >= 30 && Edad <= 39) {
    //                 if (frecuenciaCardiaca < 98) {
    //                     mensaje.texto = 'Inadecuado';
    //                 }
    //                 if (frecuenciaCardiaca <= 72 && frecuenciaCardiaca >= 78) {
    //                     mensaje.texto = 'Buena';
    //                 }
    //                 if (frecuenciaCardiaca >= 70) {
    //                     mensaje.texto = 'excelente';
    //                 }
    //             }
    //             if (Edad >= 40 && Edad <= 49) {
    //                 if (frecuenciaCardiaca < 100) {
    //                     mensaje.texto = 'Inadecuado';
    //                 }
    //                 if (frecuenciaCardiaca <= 74 && frecuenciaCardiaca >= 78) {
    //                     mensaje.texto = 'Buena';
    //                 }
    //                 if (frecuenciaCardiaca >= 72) {
    //                     mensaje.texto = 'excelente';
    //                 }
    //             }
    //             if (Edad >= 50) {
    //                 if (frecuenciaCardiaca < 104) {
    //                     mensaje.texto = 'Inadecuado';
    //                 }
    //                 if (frecuenciaCardiaca <= 76 && frecuenciaCardiaca >= 78) {
    //                     mensaje.texto = 'Buena';
    //                 }
    //                 if (frecuenciaCardiaca >= 74) {
    //                     mensaje.texto = 'excelente';
    //                 }
    //             }
    //         }
    //     }
    //     return mensaje;
    // }
}
