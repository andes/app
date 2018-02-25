# Change log RUP - 2018-02-23
## Implementa Prestación: "SCREENING DE OTOEMISIÓN ACUSTICA NEONATAL (PROCEDIMIENTO)"

## Para que funcione, además de configurar los permisos requeridos, se deben ejecutar las siguientes queries:

1. ### Insertar los siguientes Conceptos Turneables:
```
// Concepto 1
db.getCollection("conceptoTurneable").insert({
    "conceptId": "2091000013100",
    "term": "screening de otoemisión acústica neonatal (procedimiento)",
    "fsn": "screening de otoemisión acústica neonatal (procedimiento)",
    "semanticTag": "procedimiento"
})
// Concepto 2
db.getCollection("conceptoTurneable").insert({
    "fsn": "examen de garganta, nariz y oído",
    "semanticTag": "procedimiento",
    "conceptId": "113028003",
    "term": "examen de garganta, nariz y oído"
})
```
2. ### Insertar los siguientes Elementos RUP:

```
// Concepto Principal de la implementación
db.getCollection("elementosRUP").insert({
    "activo": true,
    "componente": "ScreeningDeOtoemisionAcusticaNeonatalComponent",
    "tipo": "molecula",
    "esSolicitud": false,
    "style": {
        "columns": 12.0,
        "cssClass": null
    },
    "conceptos": [
        {
            "fsn": "screening de otoemisión acústica neonatal (procedimiento)",
            "semanticTag": "procedimiento",
            "refsetIds": [
                ""
            ],
            "conceptId": "2091000013100",
            "term": "screening de otoemisión acústica neonatal"
        }
    ],
    "requeridos": [
        {
            "elementoRUP": ObjectId("5a8d9f3900161c2c15d9f463"),
            "concepto": {
                "fsn": "evaluación de antecedentes (procedimiento)",
                "semanticTag": "procedimiento",
                "term": "evaluación de antecedentes",
                "conceptId": "371580005",
                "refsetIds": [
                    "2121000013101"
                ]
            },
            "style": {
                "columns": 6.0,
                "cssClass": ""
            },
            "params": {
                "titulo": "Seleccione algún antecedente",
                "refsetId": "2121000013101",
                "tipoSelect": "select",
                "multiple": true
            }
        },
        {
            "elementoRUP": ObjectId("5a8d9f3900161c2c15d9f463"),
            "concepto": {
                "fsn": "otoemisión acústica de oído izquierdo (entidad observable)",
                "semanticTag": "entidad observable",
                "refsetIds": [
                    ""
                ],
                "conceptId": "2111000013109",
                "term": "otoemisión acústica de oído izquierdo"
            },
            "style": {
                "columns": 6.0,
                "cssClass": ""
            },
            "params": {
                "titulo": "Seleccione un resultado:",
                "refsetId": "2281000013105",
                "tipoSelect": "select",
                "multiple": false
            }
        },
        {
            "elementoRUP": ObjectId("5a8d9f3900161c2c15d9f463"),
            "concepto": {
                "fsn": "otoemisión acústica de oído derecho (entidad observable)",
                "semanticTag": "entidad observable",
                "refsetIds": [
                    ""
                ],
                "conceptId": "2101000013106",
                "term": "otoemisión acústica de oído derecho"
            },
            "style": {
                "columns": 6.0,
                "cssClass": ""
            },
            "params": {
                "titulo": "Seleccione un resultado",
                "refsetId": "2281000013105",
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
        {
            "fsn": "segunda falla en el cribado para la detección de alteraciones en la audición en el niño (hallazgo)",
            "semanticTag": "hallazgo",
            "refsetIds": [
                "900000000000497000"
            ],
            "conceptId": "185579009",
            "term": "segunda falla en el cribado para la detección de alteraciones en la audición en el niño"
        },
        {
            "fsn": "examen de garganta, nariz y oído (procedimiento)",
            "semanticTag": "procedimiento",
            "refsetIds": [
                "900000000000497000"
            ],
            "conceptId": "113028003",
            "term": "examen de garganta, nariz y oído"
        },
        {
            "fsn" : "prueba de emisión otoacústica, normal (hallazgo)",
            "term" : "prueba de emisión otoacústica, normal",
            "conceptId" : "394891000",
            "semanticTag" : "hallazgo",
            "refsetIds" : [
                "900000000000497000"
            ]
        }
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
            "fsn": "otoemisión acústica de oído derecho (entidad observable)",
            "semanticTag": "entidad observable",
            "term": "otoemisión acústica de oído derecho",
            "conceptId": "2101000013106"
        }
    ],
    "requeridos": [],
    "frecuentes": [],
    "params": null
});

```