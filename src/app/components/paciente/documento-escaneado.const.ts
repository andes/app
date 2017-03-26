export interface DocumentoEscaneado {
    regEx: RegExp;
    grupoNumeroDocumento: number;
    grupoApellido: number;
    grupoNombre: number;
    grupoSexo: number;
    grupoFechaNacimiento: number;
}

export const DocumentoEscaneados: DocumentoEscaneado[] = [
    // DNI Argentino primera versión
    // Formato: @14157955    @A@1@GUTIERREZ@ROBERTO DANIEL@ARGENTINA@31/05/1960@M@01/11/2011@00079064950@7055 @01/11/2026@421@0@ILR:2.20 C:110927.01 (GM/EXE-MOVE-HM)@UNIDAD #02 || S/N: 0040>2008>>0006
    {
        regEx: /@([0-9]+)\s*@[A-Z]+@[0-9]+@(.+)@(.+)@[A-Z]+@([0-9]{2}\/[0-9]{2}\/[0-9]{4})@([MF])@/i,
        grupoNumeroDocumento: 1,
        grupoApellido: 2,
        grupoNombre: 3,
        grupoSexo: 5,
        grupoFechaNacimiento: 4
    },
    // DNI Argentino segunda versión
    // Formato: 00327345190@GARCIA@JUAN FRANCISCO@M@23680640@A@25/08/1979@06/01/2015@209,"00327345190@GARCIA@JUAN FRANCISCO@M@23680640@A@25/08/1979@06/01/2015@209","PDF_417","1470320935751","4 ago. 2016 11:28:55",""
    {
        regEx: /[0-9]+@(.+)@(.+)@([MF])@([0-9]{7,8})@[A-Z]@([0-9]{2}\/[0-9]{2}\/[0-9]{4})@[0-9]{2}\/[0-9]{2}\/[0-9]{4}@[0-9]+,/i,
        grupoNumeroDocumento: 4,
        grupoApellido: 1,
        grupoNombre: 2,
        grupoSexo: 3,
        grupoFechaNacimiento: 5
    },
    // DNI Argentino tercera versión
    // Formato: 00125559991@PENA SAN JUAN@ORLANDA YUDITH@F@28765457@A@17/01/1944@28/12/2012
    {
        regEx: /[0-9]+@(.+)@(.+)@([MF])@([0-9]{7,8})@[A-Z]@([0-9]{2}\/[0-9]{2}\/[0-9]{4})@[0-9]{2}\/[0-9]{2}\/[0-9]{4}/i,
        grupoNumeroDocumento: 4,
        grupoApellido: 1,
        grupoNombre: 2,
        grupoSexo: 3,
        grupoFechaNacimiento: 5
    }
];


//  dni_version1: /[0-9]+@.+@.+@[M|F]@[0-9]{7,8}@[A-Z]@[0-9]{2}\/[0-9]{2}\/[0-9]{4}@[0-9]{2}\/[0-9]{2}\/[0-9]{4}/i,
//     dni_version2: {
  