/**
 * TODO: Document THIS
 */

export enum Sexo {
    'femenino', 'masculino', 'otro'
}

export enum Genero {
    'femenino', 'masculino', 'otro'
}

export enum EstadoCivil {
    'casado', 'separado', 'divorciado', 'viudo', 'soltero', 'otro'
}

export enum tipoComunicacion {
    'Teléfono Fijo', 'Teléfono Celular', 'Email'
}

export enum estados {
    'temporal', 'identificado', 'validado', 'recienNacido', 'extranjero'
}

export enum relacionTutor {
    'padre', 'madre', 'hijo', 'tutor'
}

export enum UnidadEdad {
    'Años', 'Meses', 'Días', 'Horas'
}

export enum EstadosAuditorias {
    'pendiente', 'aprobada', 'desaprobada'
}


export function titleCase(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

export function getObjeto(elemento) {
    return {
        'id': elemento,
        'nombre': titleCase(elemento)
    };
}

export function getSexo() {
    let arrSexo = Object.keys(Sexo);
    arrSexo = arrSexo.slice(arrSexo.length / 2);
    return arrSexo;
}

export function getObjSexos() {
    let arrSexo = Object.keys(Sexo);
    arrSexo = arrSexo.slice(arrSexo.length / 2);
    let salida = arrSexo.map(elem => { return { 'id': elem, 'nombre': titleCase(elem) } });
    return salida;
}

export function getObjUnidadesEdad() {
    let arrUnidadEdad = Object.keys(UnidadEdad);
    arrUnidadEdad = arrUnidadEdad.slice(arrUnidadEdad.length / 2);
    let salida = arrUnidadEdad.map(elem => { 
        return { id: elem, nombre: titleCase(elem) }
    });
    return salida;
}

export function getTipoComunicacion() {
    let arrTC = Object.keys(tipoComunicacion);
    arrTC = arrTC.slice(arrTC.length / 2);
    return arrTC;
}

export function getObjTipoComunicacion() {
    let arrTC = Object.keys(tipoComunicacion);
    arrTC = arrTC.slice(arrTC.length / 2);
    let salida = arrTC.map(elem => {
        let idEnumerado = elem.split(' ')[1] ? elem.split(' ')[1] : elem.split(' ')[0];
        console.log(idEnumerado);
        return { 'id': idEnumerado.toLowerCase(), 'nombre': titleCase(elem) }
    });
    return salida;
}

export function getGenero() {
    let arrGenero = Object.keys(Genero);
    arrGenero = arrGenero.slice(arrGenero.length / 2);
    return arrGenero;
}

export function getObjGeneros() {
    let arrGenero = Object.keys(Genero);
    arrGenero = arrGenero.slice(arrGenero.length / 2);
    let salida = arrGenero.map(elem => { return { 'id': elem, 'nombre': titleCase(elem) } });
    return salida;
}

export function getEstadoCivil() {
    let arrEstadoC = Object.keys(EstadoCivil);
    arrEstadoC = arrEstadoC.slice(arrEstadoC.length / 2);
    return arrEstadoC;
}

export function getObjEstadoCivil() {
    let arrEstadoC = Object.keys(EstadoCivil);
    arrEstadoC = arrEstadoC.slice(arrEstadoC.length / 2);
    let salida = arrEstadoC.map(elem => { return { 'id': elem, 'nombre': titleCase(elem) } });
    return salida;
}

export function getEstados() {
    let arrEstados = Object.keys(estados);
    arrEstados = arrEstados.slice(arrEstados.length / 2);
    return arrEstados;
}

export function getEstadosAuditorias() {
    let arrEstados = Object.keys(EstadosAuditorias);
    arrEstados = arrEstados.slice(arrEstados.length / 2);
    let salida = arrEstados.map(elem => { return { 'id': elem, 'nombre': titleCase(elem) } });
    return salida;
}

export function getRelacionTutor() {
    let arrRT = Object.keys(relacionTutor);
    arrRT = arrRT.slice(arrRT.length / 2);
    return arrRT;
}

export function getObjRelacionTutor() {
    let arrRT = Object.keys(relacionTutor);
    arrRT = arrRT.slice(arrRT.length / 2);
    let salida = arrRT.map(elem => { return { 'id': elem, 'nombre': titleCase(elem) } });
    return salida;
}
