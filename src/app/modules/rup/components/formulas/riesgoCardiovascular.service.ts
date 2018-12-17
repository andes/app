import { Injectable } from '@angular/core';
import { FormulaBaseService, FormularRegister } from './index';

@Injectable()
export class RiesgoCardiovascularService extends FormulaBaseService {

    public calcular(paciente, prestacion, registros) {
        const colesterol = registros[0].valor;
        const sistolica = registros[1].valor;
        const tabaquismo = registros[2].valor;
        const diabetes = registros[3].valor;
        const sexo = (paciente.genero === 'masculino') ? 1 : 0;

        const value = this.obtenerRiesgo(paciente.edad, colesterol, sistolica, tabaquismo, sexo, diabetes);
        let message = '';
        switch (value) {
            case 1:
                message = 'Riesgo bajo';
                break;
            case 2:
                message = 'Riesgo moderado';
                break;
            case 3:
                message = 'Riesgo alto';
                break;
            case 4:
                message = 'Riesgo muy alto';
                break;
            case 5:
                message = 'Riesgo crítico';
                break;
        }
        return {
            value, message
        };
    }


    private riesgoSinColesterol = {
        '11': 1,
        '12': 1,
        '13': 1,
        '14': 4,
        '21': 1,
        '22': 1,
        '23': 1,
        '24': 4,
        '31': 1,
        '32': 1,
        '33': 1,
        '34': 4,
        '41': 1,
        '42': 1,
        '43': 2,
        '44': 5,
        '111': 1,
        '112': 1,
        '113': 2,
        '114': 5,
        '121': 1,
        '122': 1,
        '123': 2,
        '124': 5,
        '131': 1,
        '132': 1,
        '133': 2,
        '134': 5,
        '141': 1,
        '142': 2,
        '143': 3,
        '144': 5,
        '1011': 1,
        '1012': 1,
        '1013': 1,
        '1014': 3,
        '1021': 1,
        '1022': 1,
        '1023': 2,
        '1024': 4,
        '1031': 1,
        '1032': 1,
        '1033': 2,
        '1034': 4,
        '1041': 1,
        '1042': 2,
        '1043': 2,
        '1044': 4,
        '1111': 1,
        '1112': 1,
        '1113': 2,
        '1114': 5,
        '1121': 1,
        '1122': 1,
        '1123': 3,
        '1124': 5,
        '1131': 1,
        '1132': 2,
        '1133': 3,
        '1134': 5,
        '1141': 2,
        '1142': 2,
        '1143': 3,
        '1144': 5,
        '10011': 1,
        '10012': 1,
        '10013': 2,
        '10014': 5,
        '10021': 1,
        '10022': 1,
        '10023': 2,
        '10024': 5,
        '10031': 1,
        '10032': 1,
        '10033': 2,
        '10034': 5,
        '10041': 2,
        '10042': 2,
        '10043': 4,
        '10044': 5,
        '10111': 1,
        '10112': 1,
        '10113': 4,
        '10114': 5,
        '10121': 1,
        '10122': 2,
        '10123': 4,
        '10124': 5,
        '10131': 1,
        '10132': 2,
        '10133': 4,
        '10134': 5,
        '10141': 2,
        '10142': 4,
        '10143': 5,
        '10144': 5,
        '11011': 1,
        '11012': 1,
        '11013': 1,
        '11014': 4,
        '11021': 1,
        '11022': 1,
        '11023': 2,
        '11024': 5,
        '11031': 1,
        '11032': 2,
        '11033': 3,
        '11034': 5,
        '11041': 2,
        '11042': 3,
        '11043': 4,
        '11044': 5,
        '11111': 1,
        '11112': 1,
        '11113': 3,
        '11114': 5,
        '11121': 1,
        '11122': 2,
        '11123': 4,
        '11124': 5,
        '11131': 2,
        '11132': 3,
        '11133': 5,
        '11134': 5,
        '11141': 3,
        '11142': 4,
        '11143': 5,
        '11144': 5
    };
    private riesgosConColesterol = {
        '111': 1,
        '112': 1,
        '113': 1,
        '114': 1,
        '115': 1,
        '121': 1,
        '122': 1,
        '123': 1,
        '124': 1,
        '125': 2,
        '131': 1,
        '132': 1,
        '133': 1,
        '134': 2,
        '135': 3,
        '141': 3,
        '142': 3,
        '143': 4,
        '144': 5,
        '145': 5,
        '211': 1,
        '212': 1,
        '213': 1,
        '214': 1,
        '215': 1,
        '221': 1,
        '222': 1,
        '223': 1,
        '224': 1,
        '225': 2,
        '231': 1,
        '232': 1,
        '233': 1,
        '234': 2,
        '235': 3,
        '241': 3,
        '242': 3,
        '243': 4,
        '244': 5,
        '245': 5,
        '311': 1,
        '312': 1,
        '313': 1,
        '314': 1,
        '315': 1,
        '321': 1,
        '322': 1,
        '323': 1,
        '324': 1,
        '325': 2,
        '331': 1,
        '332': 1,
        '333': 2,
        '334': 2,
        '335': 3,
        '341': 3,
        '342': 3,
        '343': 4,
        '344': 5,
        '345': 5,
        '411': 1,
        '412': 1,
        '413': 1,
        '414': 1,
        '415': 2,
        '421': 1,
        '422': 1,
        '423': 2,
        '424': 2,
        '425': 2,
        '431': 2,
        '432': 2,
        '433': 2,
        '434': 3,
        '435': 3,
        '441': 3,
        '442': 3,
        '443': 4,
        '444': 5,
        '445': 5,
        '1111': 1,
        '1112': 1,
        '1113': 1,
        '1114': 1,
        '1115': 1,
        '1121': 1,
        '1122': 1,
        '1123': 1,
        '1124': 2,
        '1125': 3,
        '1131': 1,
        '1132': 2,
        '1133': 3,
        '1134': 4,
        '1135': 5,
        '1141': 4,
        '1142': 5,
        '1143': 5,
        '1144': 5,
        '1145': 5,
        '1211': 1,
        '1212': 1,
        '1213': 1,
        '1214': 1,
        '1215': 2,
        '1221': 1,
        '1222': 1,
        '1223': 1,
        '1224': 2,
        '1225': 3,
        '1231': 2,
        '1232': 2,
        '1233': 3,
        '1234': 4,
        '1235': 5,
        '1241': 4,
        '1242': 5,
        '1243': 5,
        '1244': 5,
        '1245': 5,
        '1311': 1,
        '1312': 1,
        '1313': 1,
        '1314': 1,
        '1315': 2,
        '1321': 1,
        '1322': 1,
        '1323': 1,
        '1324': 2,
        '1325': 3,
        '1331': 2,
        '1332': 2,
        '1333': 3,
        '1334': 4,
        '1335': 5,
        '1341': 4,
        '1342': 5,
        '1343': 5,
        '1344': 5,
        '1345': 5,
        '1411': 1,
        '1412': 1,
        '1413': 2,
        '1414': 2,
        '1415': 2,
        '1421': 2,
        '1422': 2,
        '1423': 2,
        '1424': 3,
        '1425': 3,
        '1431': 2,
        '1432': 3,
        '1433': 3,
        '1434': 4,
        '1435': 5,
        '1441': 4,
        '1442': 5,
        '1443': 5,
        '1444': 5,
        '1445': 5,
        '10111': 1,
        '10112': 1,
        '10113': 1,
        '10114': 1,
        '10115': 1,
        '10121': 1,
        '10122': 1,
        '10123': 1,
        '10124': 1,
        '10125': 2,
        '10131': 1,
        '10132': 1,
        '10133': 1,
        '10134': 2,
        '10135': 4,
        '10141': 2,
        '10142': 3,
        '10143': 4,
        '10144': 5,
        '10145': 5,
        '10211': 1,
        '10212': 1,
        '10213': 1,
        '10214': 1,
        '10215': 1,
        '10221': 1,
        '10222': 1,
        '10223': 1,
        '10224': 1,
        '10225': 2,
        '10231': 1,
        '10232': 1,
        '10233': 2,
        '10234': 2,
        '10235': 4,
        '10241': 2,
        '10242': 3,
        '10243': 4,
        '10244': 5,
        '10245': 5,
        '10311': 1,
        '10312': 1,
        '10313': 1,
        '10314': 1,
        '10315': 2,
        '10321': 1,
        '10322': 1,
        '10323': 1,
        '10324': 2,
        '10325': 2,
        '10331': 2,
        '10332': 2,
        '10333': 2,
        '10334': 3,
        '10335': 4,
        '10341': 3,
        '10342': 4,
        '10343': 5,
        '10344': 5,
        '10345': 5,
        '10411': 1,
        '10412': 1,
        '10413': 1,
        '10414': 2,
        '10415': 2,
        '10421': 1,
        '10422': 2,
        '10423': 2,
        '10424': 2,
        '10425': 3,
        '10431': 2,
        '10432': 2,
        '10433': 3,
        '10434': 3,
        '10435': 4,
        '10441': 3,
        '10442': 4,
        '10443': 5,
        '10444': 5,
        '10445': 5,
        '11111': 1,
        '11112': 1,
        '11113': 1,
        '11114': 1,
        '11115': 1,
        '11121': 1,
        '11122': 1,
        '11123': 1,
        '11124': 2,
        '11125': 3,
        '11131': 1,
        '11132': 2,
        '11133': 2,
        '11134': 4,
        '11135': 5,
        '11141': 4,
        '11142': 5,
        '11143': 5,
        '11144': 5,
        '11145': 5,
        '11211': 1,
        '11212': 1,
        '11213': 1,
        '11214': 1,
        '11215': 2,
        '11221': 1,
        '11222': 1,
        '11223': 1,
        '11224': 2,
        '11225': 3,
        '11231': 2,
        '11232': 2,
        '11233': 3,
        '11234': 4,
        '11235': 5,
        '11241': 4,
        '11242': 5,
        '11243': 5,
        '11244': 5,
        '11245': 5,
        '11311': 1,
        '11312': 1,
        '11313': 1,
        '11314': 2,
        '11315': 2,
        '11321': 1,
        '11322': 2,
        '11323': 2,
        '11324': 3,
        '11325': 4,
        '11331': 2,
        '11332': 3,
        '11333': 4,
        '11334': 4,
        '11335': 5,
        '11341': 5,
        '11342': 5,
        '11343': 5,
        '11344': 5,
        '11345': 5,
        '11411': 1,
        '11412': 2,
        '11413': 2,
        '11414': 2,
        '11415': 3,
        '11421': 2,
        '11422': 2,
        '11423': 3,
        '11424': 3,
        '11425': 4,
        '11431': 3,
        '11432': 3,
        '11433': 4,
        '11434': 5,
        '11435': 5,
        '11441': 5,
        '11442': 5,
        '11443': 5,
        '11444': 5,
        '11445': 5,
        '100111': 1,
        '100112': 1,
        '100113': 1,
        '100114': 1,
        '100115': 1,
        '100121': 1,
        '100122': 1,
        '100123': 1,
        '100124': 2,
        '100125': 4,
        '100131': 1,
        '100132': 2,
        '100133': 3,
        '100134': 4,
        '100135': 5,
        '100141': 4,
        '100142': 5,
        '100143': 5,
        '100144': 5,
        '100145': 5,
        '100211': 1,
        '100212': 1,
        '100213': 1,
        '100214': 1,
        '100215': 2,
        '100221': 1,
        '100222': 1,
        '100223': 1,
        '100224': 2,
        '100225': 4,
        '100231': 2,
        '100232': 2,
        '100233': 3,
        '100234': 4,
        '100235': 5,
        '100241': 4,
        '100242': 5,
        '100243': 5,
        '100244': 5,
        '100245': 5,
        '100311': 1,
        '100312': 1,
        '100313': 1,
        '100314': 2,
        '100315': 2,
        '100321': 1,
        '100322': 2,
        '100323': 2,
        '100324': 3,
        '100325': 4,
        '100331': 3,
        '100332': 3,
        '100333': 4,
        '100334': 5,
        '100335': 5,
        '100341': 5,
        '100342': 5,
        '100343': 5,
        '100344': 5,
        '100345': 5,
        '100411': 1,
        '100412': 2,
        '100413': 2,
        '100414': 2,
        '100415': 3,
        '100421': 2,
        '100422': 2,
        '100423': 3,
        '100424': 3,
        '100425': 4,
        '100431': 3,
        '100432': 3,
        '100433': 4,
        '100434': 5,
        '100435': 5,
        '100441': 5,
        '100442': 5,
        '100443': 5,
        '100444': 5,
        '100445': 5,
        '101111': 1,
        '101112': 1,
        '101113': 1,
        '101114': 1,
        '101115': 2,
        '101121': 1,
        '101122': 1,
        '101123': 2,
        '101124': 3,
        '101125': 4,
        '101131': 2,
        '101132': 3,
        '101133': 5,
        '101134': 5,
        '101135': 5,
        '101141': 5,
        '101142': 5,
        '101143': 5,
        '101144': 5,
        '101145': 5,
        '101211': 1,
        '101212': 1,
        '101213': 1,
        '101214': 2,
        '101215': 3,
        '101221': 1,
        '101222': 2,
        '101223': 2,
        '101224': 3,
        '101225': 4,
        '101231': 3,
        '101232': 3,
        '101233': 5,
        '101234': 5,
        '101235': 5,
        '101241': 5,
        '101242': 5,
        '101243': 5,
        '101244': 5,
        '101245': 5,
        '101311': 1,
        '101312': 1,
        '101313': 1,
        '101314': 2,
        '101315': 3,
        '101321': 2,
        '101322': 2,
        '101323': 2,
        '101324': 3,
        '101325': 4,
        '101331': 3,
        '101332': 3,
        '101333': 5,
        '101334': 5,
        '101335': 5,
        '101341': 5,
        '101342': 5,
        '101343': 5,
        '101344': 5,
        '101345': 5,
        '101411': 2,
        '101412': 2,
        '101413': 3,
        '101414': 3,
        '101415': 4,
        '101421': 3,
        '101422': 3,
        '101423': 4,
        '101424': 5,
        '101425': 5,
        '101431': 4,
        '101432': 5,
        '101433': 5,
        '101434': 5,
        '101435': 5,
        '101441': 5,
        '101442': 5,
        '101443': 5,
        '101444': 5,
        '101445': 5,
        '110111': 1,
        '110112': 1,
        '110113': 1,
        '110114': 1,
        '110115': 1,
        '110121': 1,
        '110122': 1,
        '110123': 1,
        '110124': 1,
        '110125': 3,
        '110131': 1,
        '110132': 2,
        '110133': 2,
        '110134': 3,
        '110135': 5,
        '110141': 3,
        '110142': 5,
        '110143': 5,
        '110144': 5,
        '110145': 5,
        '110211': 1,
        '110212': 1,
        '110213': 1,
        '110214': 1,
        '110215': 2,
        '110221': 1,
        '110222': 1,
        '110223': 1,
        '110224': 2,
        '110225': 3,
        '110231': 2,
        '110232': 2,
        '110233': 3,
        '110234': 4,
        '110235': 5,
        '110241': 4,
        '110242': 5,
        '110243': 5,
        '110244': 5,
        '110245': 5,
        '110311': 1,
        '110312': 1,
        '110313': 1,
        '110314': 2,
        '110315': 2,
        '110321': 1,
        '110322': 2,
        '110323': 2,
        '110324': 3,
        '110325': 4,
        '110331': 3,
        '110332': 3,
        '110333': 4,
        '110334': 5,
        '110335': 5,
        '110341': 5,
        '110342': 5,
        '110343': 5,
        '110344': 5,
        '110345': 5,
        '110411': 2,
        '110412': 2,
        '110413': 2,
        '110414': 3,
        '110415': 4,
        '110421': 2,
        '110422': 3,
        '110423': 3,
        '110424': 4,
        '110425': 5,
        '110431': 3,
        '110432': 4,
        '110433': 5,
        '110434': 5,
        '110435': 5,
        '110441': 5,
        '110442': 5,
        '110443': 5,
        '110444': 5,
        '110445': 5,
        '111111': 1,
        '111112': 1,
        '111113': 1,
        '111114': 1,
        '111115': 3,
        '111121': 1,
        '111122': 1,
        '111123': 2,
        '111124': 2,
        '111125': 5,
        '111131': 2,
        '111132': 3,
        '111133': 4,
        '111134': 5,
        '111135': 5,
        '111141': 5,
        '111142': 5,
        '111143': 5,
        '111144': 5,
        '111145': 5,
        '111211': 1,
        '111212': 1,
        '111213': 1,
        '111214': 2,
        '111215': 3,
        '111221': 1,
        '111222': 2,
        '111223': 2,
        '111224': 3,
        '111225': 5,
        '111231': 3,
        '111232': 4,
        '111233': 5,
        '111234': 5,
        '111235': 5,
        '111241': 5,
        '111242': 5,
        '111243': 5,
        '111244': 5,
        '111245': 5,
        '111311': 1,
        '111312': 2,
        '111313': 2,
        '111314': 3,
        '111315': 4,
        '111321': 2,
        '111322': 3,
        '111323': 3,
        '111324': 4,
        '111325': 5,
        '111331': 4,
        '111332': 5,
        '111333': 5,
        '111334': 5,
        '111335': 5,
        '111341': 5,
        '111342': 5,
        '111343': 5,
        '111344': 5,
        '111345': 5,
        '111411': 2,
        '111412': 3,
        '111413': 3,
        '111414': 4,
        '111415': 5,
        '111421': 3,
        '111422': 4,
        '111423': 5,
        '111424': 5,
        '111425': 5,
        '111431': 5,
        '111432': 5,
        '111433': 5,
        '111434': 5,
        '111435': 5,
        '111441': 5,
        '111442': 5,
        '111443': 5,
        '111444': 5,
        '111445': 5
    };




    /**
     * Calcula el riesgo cardio vascular y retorna un puntaje del 1 al 5
     * @param edad edad que la obtenemos del paciente de la prestacion
     * @param colesterol Valor numerico que cargan en la molecula
     * @param tension Valor numerico que cargan en la molecula
     * @param tabaquismo Bool que lo optenemos de la molecula
     * @param sexo Lo capturamos del paciente.. --> TRUE corresponde a masculino y FALSE corresponde a sexo femenino
     * @param diabetes Bool que capturamos de la molecula.
     */
    obtenerRiesgo(edad, colesterol, tension, tabaquismo, sexo, diabetes) {
        let clave = this.generarClaveBusqueda(edad, colesterol, tension, tabaquismo, sexo, diabetes);
        clave = clave.replace(/^0+(?!\.|$)/, '');
        let valorRiesgoCardio;
        if (colesterol == null) {
            valorRiesgoCardio = this.obtenerRiesgoSinColesterol(clave);
        } else {
            valorRiesgoCardio = this.obtenerRiesgoConColesterol(clave);
        }
        return valorRiesgoCardio;
    }


    generarClaveBusqueda(edad, colesterol, tension, tabaquismo, sexo, diabetes) {
        let clave = '';
        clave += (diabetes === true) ? '1' : '0';
        clave += (sexo === true) ? '1' : '0';
        clave += (tabaquismo === true) ? '1' : '0';
        {
            if (edad < 50) {
                clave += '1';
            } else if (edad < 60) {
                clave += '2';
            } else if (edad < 70) {
                clave += '3';
            } else {
                clave += '4';
            }
        }
        {
            if (tension < 131) {
                clave += '1';
            } else if (tension < 151) {
                clave += '2';
            } else if (tension < 171) {
                clave += '3';
            } else {
                clave += '4';
            }
        }
        if (colesterol != null) {
            if (colesterol < 175) {
                clave += '1';
            } else if (colesterol < 213) {
                clave += '2';
            } else if (colesterol < 251) {
                clave += '3';
            } else if (colesterol < 291) {
                clave += '4';
            } else {
                clave += '5';
            }
        }
        return clave;
    }

    obtenerRiesgoSinColesterol(clave) {
        return this.riesgoSinColesterol[clave];
    }
    obtenerRiesgoConColesterol(clave) {
        return this.riesgosConColesterol[clave];
    }
}

FormularRegister.register('RiesgoCardiovascularService', RiesgoCardiovascularService);
