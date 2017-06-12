import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'organizacion' })
export class OrganizacionPipe implements PipeTransform {
  transform(value: any): any {
    let nombre = value;
    let siglas = '';
    let palabrasEspeciales = ['DE', 'DEL', 'LA', 'Y', 'de', 'del', 'la', 'y'];
    // Se busca la posición del guión - que va a separar en dos conjuntos de palabras
    let nombreOrg = nombre.split('(');
    let frases = nombreOrg[0].split(' - ');
    // let frases = nombre.split(' - ');
    if (frases) {
      let palabraInicial = frases[0].split(' ');
      // En la primera palabra trae la inicial
      if (palabraInicial.length === 1) {
           siglas = palabraInicial[0].trim();
      } else {
         // Por cada palabra de la cadena del nombre se toma la inicial
         palabraInicial.forEach(palabra => {
           if (!(palabrasEspeciales.indexOf(palabra) > -1)) {
             siglas += palabra.charAt(0).toUpperCase();
           }
         });
      }
    }

    return siglas;
  }
}
