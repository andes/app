import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Observable';



@Injectable()
export class InternacionService {

    private url = '/modules/rup/internaciones';
    constructor(private server: Server) { }


    getInfoCenso(params: any): Observable<any[]> {
        return this.server.get(this.url + '/censo', { params: params });
    }

    getCensoMensual(params: any): Observable<any[]> {
        return this.server.get(this.url + '/censoMensual', { params: params });
    }

    liberarCama(idInternacion: any, fecha): Observable<any> {
        let param = {
            fecha: fecha
        };
        return this.server.patch(this.url + '/desocuparCama/' + idInternacion, param);
    }

    getCamaDisponibilidadCenso(params: any): Observable<any[]> {
        return this.server.get(this.url + '/censo/disponibilidad', { params: params });
    }

    getCodigoPulsera(organizacion, internacion) {
        console.log(organizacion.nombre);
        let cadenaOrganizacion = organizacion.nombre.split(' ');
        let cadenaUO = internacion.cama.ultimoEstado.unidadOrganizativa.term.split(' ');
        // console.log(cadena);
        let pulsera = '^XA' +

            '^FO50,350^GFA,1957,1957,19,U03F,T03IF8,T07IFC,S01FE1FE,S03E01FF,S03C03CF,S07803878,S0F00783C,S0F00703C,R01E00F01E,R01C00E01E,R03C01E00E,R03801E00F,R03803E007,R07003F0078,R07003F0038,R0F007F8038,R0E0073803C,Q01E0073801C,Q01C00F3C01C,Q01C00E1C01E,Q03C01E1C00E,Q03801C1E00E,Q07801C0E00F,Q07003C0E007,Q0700380F0078,Q0F0038070078,Q0E0078070038,P01E007007803C,P01C007003803C,P03C00F003801C,P03800E003C01E,P03800E001C01E,P07801E001C00E,L03E007001C001E00F,L07F80F003CI0E00F,K01FFC0E0038I0E007,K03E3E1E0038I0F0078,K07C1E1C0078I070078,K0F80F1C007J070038J01IF8,J01F007B800FJ07803CI01JFE,J03E003F800EJ03801CI07FF8FF,J07C003F801EJ03801CI0IF00F8,J0F8001F001CJ03C01E001F0FC07C,I01FJ0F003CJ01C00E001E03E03C,I03EJ0F0038J01C00E003C03F01E,I07CJ078078J01E00F007803F00F,I0F8J03C0FL0E007007007F807,001FK01E0FL0E00700F0073C078,007EK01F3EL0F00780E00F1E03C,00F8L0FFCL0700381E00E0F01E,03FM07F8L07003C1C01E0781F,07CM01EM07801C3C01C07C0F8,078V03801C3801C03E07E,02W03C00E3803C01F03F8,Y01C00E7803800FC0FFE,Y01C00F70078007F07FFCY01E007F007I01JFE,g0E007E00FJ07IF,g0F003E00EJ01FF,g07003C01E,g07803C01C,g03807803C,g03C078078,g01E0F01F,gG0F7E07E,gG07FE7FC,gG03JF,gH0IFC,,:::::::::::::::018K0C008I01FFK01IF8J07E,038K0C018I03FFEJ03IF8I01FF,03CK0E018K01FR03838,03CK0F018L07R03818,07CK0F818L038Q03,06EK0DC18L018Q038,0E6K0CC18L018Q03C,0C7K0CE18L018Q01F,1C3K0C718L018I01IFK07E,1838J0C398L018J0FFEK01F,1818J0C198L018S078,381CJ0C1D8L018S018,301CJ0C0F8L038S018,700CJ0C078L03R07018,600EJ0C038L0FR07838,E006J0C018I01FFEJ01IF8I01FF,4006J0C018I03FF8J03IF8J0FE,,^FS' +

            'linea separadora' +
            '^FO25,500^GB300,1,2^FS' +
            '^FX informacion de la organizacion' +
            '^CF0,30';
        let pixel = 560;
        cadenaOrganizacion.forEach(element => {
            pulsera + '^FO20,' + pixel + '^A0,50,35^FD' + element + '^FS';
            pixel + 40;
        });
        // '^FO20,560^A0,50,35^FDHospital^FS' +
        //     '^FO20,600^A0,50,35^FDCastro^FS' +
        //     '^FO20,640^A0,50,35^FDRendon^FS' +
        pulsera +
            'linea separadora' +
            '^FO0,' + pixel + 40 + '^GB500,1,2^FS' +

            'Unidad organizativa' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FDDepartamento^FS' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FDde cirugia^FS' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FDplastica^FS' +

            '^LH0,0' +

            '^FX' +

            'linea separadora' +
            '^FO0,' + pixel + 40 + '^GB500,1,2^FS' +

            '^CF0,40' +
            '^FX Info del usuario' +
            '^CF0,30' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FD' + internacion.ultimaInternacion.paciente.apellido + '^FS' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FD' + internacion.ultimaInternacion.paciente.nombre + '^FS' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FD' + internacion.ultimaInternacion.paciente.documento + '^FS' +
            // '^FO20,1020^A0,50,35^FDFernandez IORO^FS' +
            // '^FO20,1060^A0,50,35^FDArgentina^FS' +

            '^FX codigo QR' +
            '^FT20,' + pixel + 400 + '^BQN,2,18,,0^FDHA,' + internacion.ultimaInternacion.paciente.id + '^FS' +

            'linea separadora' +
            '^FO0,' + pixel + 40 + '^GB500,1,2^FS' +
            '--------------------------------------------------------------------------' +
            'Repito la info en la pulsera.' +

            '^FO50,' + pixel + 40 + '^GFA,1957,1957,19,U03F,T03IF8,T07IFC,S01FE1FE,S03E01FF,S03C03CF,S07803878,S0F00783C,S0F00703C,R01E00F01E,R01C00E01E,R03C01E00E,R03801E00F,R03803E007,R07003F0078,R07003F0038,R0F007F8038,R0E0073803C,Q01E0073801C,Q01C00F3C01C,Q01C00E1C01E,Q03C01E1C00E,Q03801C1E00E,Q07801C0E00F,Q07003C0E007,Q0700380F0078,Q0F0038070078,Q0E0078070038,P01E007007803C,P01C007003803C,P03C00F003801C,P03800E003C01E,P03800E001C01E,P07801E001C00E,L03E007001C001E00F,L07F80F003CI0E00F,K01FFC0E0038I0E007,K03E3E1E0038I0F0078,K07C1E1C0078I070078,K0F80F1C007J070038J01IF8,J01F007B800FJ07803CI01JFE,J03E003F800EJ03801CI07FF8FF,J07C003F801EJ03801CI0IF00F8,J0F8001F001CJ03C01E001F0FC07C,I01FJ0F003CJ01C00E001E03E03C,I03EJ0F0038J01C00E003C03F01E,I07CJ078078J01E00F007803F00F,I0F8J03C0FL0E007007007F807,001FK01E0FL0E00700F0073C078,007EK01F3EL0F00780E00F1E03C,00F8L0FFCL0700381E00E0F01E,03FM07F8L07003C1C01E0781F,07CM01EM07801C3C01C07C0F8,078V03801C3801C03E07E,02W03C00E3803C01F03F8,Y01C00E7803800FC0FFE,Y01C00F70078007F07FFCY01E007F007I01JFE,g0E007E00FJ07IF,g0F003E00EJ01FF,g07003C01E,g07803C01C,g03807803C,g03C078078,g01E0F01F,gG0F7E07E,gG07FE7FC,gG03JF,gH0IFC,,:::::::::::::::018K0C008I01FFK01IF8J07E,038K0C018I03FFEJ03IF8I01FF,03CK0E018K01FR03838,03CK0F018L07R03818,07CK0F818L038Q03,06EK0DC18L018Q038,0E6K0CC18L018Q03C,0C7K0CE18L018Q01F,1C3K0C718L018I01IFK07E,1838J0C398L018J0FFEK01F,1818J0C198L018S078,381CJ0C1D8L018S018,301CJ0C0F8L038S018,700CJ0C078L03R07018,600EJ0C038L0FR07838,E006J0C018I01FFEJ01IF8I01FF,4006J0C018I03FF8J03IF8J0FE,,^FS' +

            'linea separadora' +
            '^FO25,' + pixel + 150 + '^GB300,1,2^FS' +

            '^FX informacion de la organizacion' +
            '^CF0,30' +
            '^FO20,' + pixel + 60 + '^A0,50,35^FDHospital^FS' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FDCastro^FS' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FDRendon^FS' +

            'linea separadora' +
            '^FO0,' + pixel + 40 + '^GB500,1,2^FS' +

            'Unidad organizativa' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FDDepartamento^FS' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FDde cirugia^FS' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FDplastica^FS' +

            '^LH0,0' +

            '^FX ' +

            'linea separadora' +
            '^FO0,' + pixel + 60 + '^GB500,1,2^FS' +

            '^CF0,40' +
            '^FX Info del usuario' +
            '^CF0,30' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FD' + internacion.ultimaInternacion.paciente.apellido + '^FS' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FD' + internacion.ultimaInternacion.paciente.nombre + '^FS' +
            '^FO20,' + pixel + 40 + '^A0,50,35^FD' + internacion.ultimaInternacion.paciente.documento + '^FS' +
            // '^FO20,2320^A0,50,35^FDFernandez IORO^FS' +
            // '^FO20,2360^A0,50,35^FDArgentina^FS' +

            '^FX codigo QR' +
            '^FT20,' + pixel + 400 + '^BQN,2,18,,0^FDHA,' + internacion.ultimaInternacion.paciente.id + '^FS' +
            '^XZ';

        return pulsera;
    }

}
