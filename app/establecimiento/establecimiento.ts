/*Es la clase Establecimiento pero lo llamo efector para con confundir con el componente*/
export class Efector {
    id: Number;
    codigoSisa: Number;
    nombre: String;
    descripcion: String;
    complejidad: Number;
    cuie: String;
    domicilio: String;
    tipoEstablecimiento: {
        id: Number;
        nombre: String;
    }
    zona: {
        id: Number;
        nombre: String
    }
}