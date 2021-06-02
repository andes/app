import { Injectable } from '@angular/core';

export interface DocumentoEscaneado {
    regEx: RegExp;
    grupoNumeroDocumento: number;
    grupoApellido: number;
    grupoNombre: number;
    grupoSexo: number;
    grupoFechaNacimiento: number;
    grupoTramite: number;
}

export const DocumentoEscaneados: DocumentoEscaneado[] = [
    // DNI Argentino primera versión
    {
        regEx: /@([MF]*[A-Z0-9]+)\s*@[A-Z]+@[0-9]+@([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+)@([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+)@[A-Z]+@([0-9]{2}\/[0-9]{2}\/[0-9]{4})@([MF])@([0-9]{2}\/[0-9]{2}\/[0-9]{4})@([0-9]+)@/i,
        grupoNumeroDocumento: 1,
        grupoApellido: 2,
        grupoNombre: 3,
        grupoSexo: 5,
        grupoFechaNacimiento: 4,
        grupoTramite: 7
    },
    // DNI Argentino segunda y tercera versión
    // Formato: 00327345190@GARCIA@JUAN FRANCISCO@M@23680640@A@25/08/1979@06/01/2015@209
    // Formato: 00125559991@PENA SAN JUAN@ORLANDA YUDITH@F@28765457@A@17/01/1944@28/12/2012
    {
        regEx: /([0-9]+)@([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+)@([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+)@([MF])@([MF]*[0-9]+)@[A-Z]@([0-9]{2}\/[0-9]{2}\/[0-9]{4})(.*)/i,
        grupoNumeroDocumento: 5,
        grupoApellido: 2,
        grupoNombre: 3,
        grupoSexo: 4,
        grupoFechaNacimiento: 6,
        grupoTramite: 1
    },

    // QR ACTA DE NACIMIENTO
    // Formato: INOSTROZA, Ramiro Daniel DNI: 54852844Tomo: 5Folio: 88Acta: 507Año: 2015Formato de archivo de imágen no reconocido
    {
        regEx: /([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+),([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+)([DNI: ]{5})([0-9]+)(.*)/i,
        grupoNumeroDocumento: 4,
        grupoApellido: 1,
        grupoNombre: 2,
        grupoSexo: 0,
        grupoFechaNacimiento: 0,
        grupoTramite: null
    }
];

@Injectable()
export class ScanParser {

    public scan(texto: string) {
        const scanFormat = this.findFormat(texto);
        if (scanFormat) {
            return this.parseDocumentoEscaneado(scanFormat, texto);
        }
        return null;
    }

    /**
     * Busca la RegExp que matchee con el texto escaneado
     */
    private findFormat(textoLibre): any {
        for (const key in DocumentoEscaneados) {
            if (DocumentoEscaneados[key].regEx.test(textoLibre)) {
                return DocumentoEscaneados[key];
            }
        }
        return null;
    }

    /**
     * Extrae los datos del documento escaneado según la regex que macheo anteriormente
     */

    private parseDocumentoEscaneado(documento: any, textoLibre) {

        const datos = textoLibre.match(documento.regEx);
        let sexo = '';
        if (documento.grupoSexo > 0) {
            sexo = (datos[documento.grupoSexo].toUpperCase() === 'F') ? 'Femenino' : 'Masculino';
        }

        return {
            nombre: datos[documento.grupoNombre],
            apellido: datos[documento.grupoApellido],
            documento: datos[documento.grupoNumeroDocumento].replace(/\D/g, ''),
            fechaNacimiento: datos[documento.grupoFechaNacimiento],
            tramite: documento.grupoTramite ? datos[documento.grupoTramite] : '',
            sexo,
            genero: sexo,
            telefono: null
        };
    }
}