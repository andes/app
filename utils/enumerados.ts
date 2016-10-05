export enum Sexo {
   "femenino", "masculino", "otro"
}

export enum Genero {
   "femenino", "masculino", "otro"
}

export enum EstadoCivil {
   "casado", "separado", "divorciado", "viudo", "soltero", "otro"
}

export enum tipoComunicacion {
   "Teléfono Fijo", "Teléfono Celular", "Email"
}

export function getSexo(){
       let arrSexo = Object.keys(Sexo);
       arrSexo = arrSexo.slice(arrSexo.length / 2);
       return arrSexo;
}

export function getTipoComunicacion(){
       let arrTC = Object.keys(tipoComunicacion);
       arrTC = arrTC.slice(arrTC.length / 2);
       return arrTC;
}

export function getGenero(){
       let arrGenero = Object.keys(Genero);
       arrGenero = arrGenero.slice(arrGenero.length / 2);
       return arrGenero;
}

export function getEstadoCivil(){
       let arrEstadoC = Object.keys(EstadoCivil);
       arrEstadoC = arrEstadoC.slice(arrEstadoC.length / 2);
       return arrEstadoC;
}