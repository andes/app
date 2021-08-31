/**
 * TODO: Document THIS
 */

export enum Sexo {
    'femenino',
    'masculino',
    'otro'
}

export enum Genero {
    'femenino',
    'masculino',
    'otro'
}

export enum EstadoCivil {
    'casado',
    'separado',
    'divorciado',
    'viudo',
    'soltero',
    'otro'
}

export enum tipoComunicacion {
    'Teléfono Fijo',
    'Teléfono Celular',
    'Email'
}

export enum estados {
    'temporal',
    'identificado',
    'validado',
    'recienNacido',
    'extranjero'
}

export enum relacionTutor {
    'padre',
    'madre',
    'hijo',
    'tutor'
}

export enum UnidadEdad {
    'años',
    'meses',
    'días',
    'horas'
}

export enum EstadosAuditorias {
    'pendiente',
    'aprobada',
    'desaprobada'
}

export enum PrioridadesPrestacion {
    'no prioritario',
    'urgencia',
    'emergencia'
}

export enum EstadosEspacios {
    'disponible',
    'mantenimiento',
    'clausurado',
    'baja permanente'
}

export enum TipoIdentificacion {
    'pasaporte',
    'dni extranjero'
}

export enum Censo {
    'Censable',
    'No Censable'
}

export enum estadosInternacion {
    'ejecucion',
    'validada'
}

export enum Meses {
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
}

export enum MotivosLiberacion {
    'Error',
    'Paciente canceló',
    'Paciente cambió turno',
    'No se pudo informar el turno',
    'Otro'
}

export function titleCase(str) {
    return str.toLowerCase().split(' ').map((word) => {
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
    const salida = arrSexo.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}

export function getTipoIdentificacion() {
    let arrTipoId = Object.keys(TipoIdentificacion);
    arrTipoId = arrTipoId.slice(arrTipoId.length / 2);
    return arrTipoId;
}

export function getObjTipoIdentificacion() {
    let arrTipoId = Object.keys(TipoIdentificacion);
    arrTipoId = arrTipoId.slice(arrTipoId.length / 2);
    const salida = arrTipoId.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}
export function getObjCenso() {
    let arrCenso = Object.keys(Censo);
    arrCenso = arrCenso.slice(arrCenso.length / 2);
    const salida = arrCenso.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}

export function getObjUnidadesEdad() {
    let arrUnidadEdad = Object.keys(UnidadEdad);
    arrUnidadEdad = arrUnidadEdad.slice(arrUnidadEdad.length / 2);
    const salida = arrUnidadEdad.map(elem => {
        return {
            id: elem,
            nombre: titleCase(elem)
        };
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
    const salida = arrTC.map(elem => {
        const idEnumerado = elem.split(' ')[1] ? elem.split(' ')[1] : elem.split(' ')[0];
        return {
            'id': idEnumerado.toLowerCase(),
            'nombre': titleCase(elem)
        };
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
    const salida = arrGenero.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
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
    const salida = arrEstadoC.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}

export function getEstados() {
    let arrEstados = Object.keys(estados);
    arrEstados = arrEstados.slice(arrEstados.length / 2);
    return arrEstados;
}

export function getPrioridades() {
    let arrPrioridades = Object.keys(PrioridadesPrestacion);
    arrPrioridades = arrPrioridades.slice(arrPrioridades.length / 2);
    return arrPrioridades;
}

export function getEstadosAuditorias() {
    let arrEstados = Object.keys(EstadosAuditorias);
    arrEstados = arrEstados.slice(arrEstados.length / 2);
    const salida = arrEstados.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}

export function getEstadosEspacios() {
    let arrEstados = Object.keys(EstadosEspacios);
    arrEstados = arrEstados.slice(arrEstados.length / 2);
    const salida = arrEstados.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
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
    const salida = arrRT.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}

export function getObjEstadoInternacion() {
    let array = Object.keys(estadosInternacion);
    array = array.slice(array.length / 2);
    const salida = array.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}

export function getObjMeses() {
    let arrMeses = Object.keys(Meses);
    arrMeses = arrMeses.slice(arrMeses.length / 2);
    const salida = arrMeses.map((elem, index) => {
        return {
            'id': index + 1,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}

export function getMotivosLiberacion() {
    return getObj(MotivosLiberacion);
}

function getObj(data) {
    let array = Object.keys(data);
    array = array.slice(array.length / 2);
    const salida = array.map(elem => {
        return {
            'id': elem,
            'nombre': titleCase(elem)
        };
    });
    return salida;
}
