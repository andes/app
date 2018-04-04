# Change log RUP - 2018-04-03
## Implementa Prestación: "CONSULTA DE ODONTOLOGÍA (PROCEDIMIENTO)"

## Para que funcione, además de configurar los permisos requeridos, se deben ejecutar las siguientes queries:

1. ### Insertar los siguientes Conceptos Turneables:
```
// Concepto 1
db.getCollection("conceptoTurneable").insert({
    "conceptId" : "173291009",
    "fsn" : "extracción simple de diente (procedimiento)",
    "term" : "extracción simple de diente",
	"semanticTag" : "procedimiento",
	"refsetIds" : [
		"900000000000497000"
	],
})
// TODO: Conceptos
```
2. ### Insertar los siguientes Elementos RUP:

```
// Concepto Principal de la implementación
db.getCollection("elementosRUP").insert({
    "activo": true,
    "componente": "ConsultaDeOdontologiaComponent",
    "tipo": "molecula",
    "esSolicitud": false,
    "style": {
        "columns": 12.0,
        "cssClass": null
    },
    "conceptos": [
        {
            "conceptId" : "34043003",
            "term" : "consulta de odontología",
            "fsn" : "consulta de odontología",
            "semanticTag" : "procedimiento"
            "refsetIds":[
                "1661000013109"
            ]
        }
    ],
    "requeridos": [
        {
            "elementoRUP": ObjectId("5ac3b7acd14c471590705a26"),
            "concepto": {
                "conceptId" : "173291009",
                "fsn" : "extracción simple de diente (procedimiento)",
                "term" : "extracción simple de diente",
                "semanticTag" : "procedimiento",
            },
            "style": {
                "columns": 6.0,
                "cssClass": ""
            },
            "params": {
                "titulo": "Seleccione una pieza dentaria",
                "refsetId": "2121000013101",
                "tipoSelect": "select",
                "multiple": false
            }
        }
    ],
    "frecuentes": [
        {
            "fsn": "primera falla en el cribado para la detección de alteraciones en la audición en el niño (hallazgo)",
            "semanticTag": "hallazgo",
            "refsetIds": [
                "900000000000497000"
            ],
            "conceptId": "185577006",
            "term": "primera falla en el cribado para la detección de alteraciones en la audición en el niño"
        },
    ]
});
```
### Insertar el siguiente Elemento RUP, que permite la selección de conceptos SNOMED como valores de resultados de otoemisiones
```
// Select con datos de ReferenceSet de Resultados de otoemisión y Antecendentes para estudio de otoemisiones acústicas
db.getCollection("elementosRUP").insert({
    "activo": true,
    "componente": "SelectPorRefsetComponent",
    "tipo": "atomo",
    "esSolicitud": false,
    "style": {
        "columns": 12.0,
        "cssClass": null
    },
    "conceptos": [
        {
            "fsn": "evaluación de antecedentes (procedimiento)",
            "semanticTag": "procedimiento",
            "term": "evaluación de antecedentes",
            "conceptId": "371580005"
        },
        {
            "fsn": "otoemisión acústica de oído derecho (entidad observable)",
            "semanticTag": "entidad observable",
            "term": "otoemisión acústica de oído derecho",
            "conceptId": "2101000013106"
        },
        {
            "fsn" : "otoemisión acústica de oído izquierdo (entidad observable)",
            "semanticTag" : "entidad observable",
            "conceptId" : "2111000013109",
            "term" : "otoemisión acústica de oído izquierdo"
        }
    ],
    "requeridos": [],
    "frecuentes": [],
    "params": null
});

```