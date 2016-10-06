"use strict";
(function (Sexo) {
    Sexo[Sexo["femenino"] = 0] = "femenino";
    Sexo[Sexo["masculino"] = 1] = "masculino";
    Sexo[Sexo["otro"] = 2] = "otro";
})(exports.Sexo || (exports.Sexo = {}));
var Sexo = exports.Sexo;
(function (Genero) {
    Genero[Genero["femenino"] = 0] = "femenino";
    Genero[Genero["masculino"] = 1] = "masculino";
    Genero[Genero["otro"] = 2] = "otro";
})(exports.Genero || (exports.Genero = {}));
var Genero = exports.Genero;
(function (EstadoCivil) {
    EstadoCivil[EstadoCivil["casado"] = 0] = "casado";
    EstadoCivil[EstadoCivil["separado"] = 1] = "separado";
    EstadoCivil[EstadoCivil["divorciado"] = 2] = "divorciado";
    EstadoCivil[EstadoCivil["viudo"] = 3] = "viudo";
    EstadoCivil[EstadoCivil["soltero"] = 4] = "soltero";
    EstadoCivil[EstadoCivil["otro"] = 5] = "otro";
})(exports.EstadoCivil || (exports.EstadoCivil = {}));
var EstadoCivil = exports.EstadoCivil;
(function (tipoComunicacion) {
    tipoComunicacion[tipoComunicacion["Teléfono Fijo"] = 0] = "Teléfono Fijo";
    tipoComunicacion[tipoComunicacion["Teléfono Celular"] = 1] = "Teléfono Celular";
    tipoComunicacion[tipoComunicacion["Email"] = 2] = "Email";
})(exports.tipoComunicacion || (exports.tipoComunicacion = {}));
var tipoComunicacion = exports.tipoComunicacion;
(function (estados) {
    estados[estados["temporal"] = 0] = "temporal";
    estados[estados["identificado"] = 1] = "identificado";
    estados[estados["validado"] = 2] = "validado";
    estados[estados["recienNacido"] = 3] = "recienNacido";
    estados[estados["extranjero"] = 4] = "extranjero";
})(exports.estados || (exports.estados = {}));
var estados = exports.estados;
(function (relacionTutor) {
    relacionTutor[relacionTutor["padre"] = 0] = "padre";
    relacionTutor[relacionTutor["madre"] = 1] = "madre";
    relacionTutor[relacionTutor["hijo"] = 2] = "hijo";
    relacionTutor[relacionTutor["tutor"] = 3] = "tutor";
})(exports.relacionTutor || (exports.relacionTutor = {}));
var relacionTutor = exports.relacionTutor;
function getSexo() {
    var arrSexo = Object.keys(Sexo);
    arrSexo = arrSexo.slice(arrSexo.length / 2);
    return arrSexo;
}
exports.getSexo = getSexo;
function getTipoComunicacion() {
    var arrTC = Object.keys(tipoComunicacion);
    arrTC = arrTC.slice(arrTC.length / 2);
    return arrTC;
}
exports.getTipoComunicacion = getTipoComunicacion;
function getGenero() {
    var arrGenero = Object.keys(Genero);
    arrGenero = arrGenero.slice(arrGenero.length / 2);
    return arrGenero;
}
exports.getGenero = getGenero;
function getEstadoCivil() {
    var arrEstadoC = Object.keys(EstadoCivil);
    arrEstadoC = arrEstadoC.slice(arrEstadoC.length / 2);
    return arrEstadoC;
}
exports.getEstadoCivil = getEstadoCivil;
function getEstados() {
    var arrEstados = Object.keys(estados);
    arrEstados = arrEstados.slice(arrEstados.length / 2);
    return arrEstados;
}
exports.getEstados = getEstados;
function getRelacionTutor() {
    var arrRT = Object.keys(relacionTutor);
    arrRT = arrRT.slice(arrRT.length / 2);
    return arrRT;
}
exports.getRelacionTutor = getRelacionTutor;
//# sourceMappingURL=enumerados.js.map