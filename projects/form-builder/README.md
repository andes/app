# FormBuilder
### Ejemplo

```
    init = {
        paciente: {
            nombre: 'HOLA'
        }
    };

    template = [
        {
            type: 'seccion',
            title: 'HOLA',
            componentes: [
                // { type: 'texto', value: 'HOLA' },
                { type: 'input', label: 'probando 1', required: true, key: 'paciente.nombre' },
                { type: 'input', label: 'probando 2', required: { 'organizacion.id': '1' }, key: 'paciente.apellido' },
                { type: 'datetime', label: 'Fecha Nacimiento', required: true, key: 'paciente.fechaNacimiento', format: 'date' },
                {
                    type: 'input',
                    label: 'probando 3',
                    required: true,
                    key: 'paciente.alias',
                    cond: { 'organizacion.id': '1' }
                },
                {
                    type: 'select',
                    label: 'soy un select',
                    required: true,
                    key: 'organizacion',
                    // request: {
                    //     url: '/core/tm/organizaciones',
                    //     searchKey: 'nombre',
                    //     params: {
                    //         fields: 'nombre',
                    //         sisa: '$paciente.nombre'
                    //     }
                    // }
                    items: [
                        { nombre:' juan', id: '1' },
                        { nombre:' beto', id: '2' }
                    ]
                },
            ]
        },
        { type: 'bool', label: 'es un bool', format: 'slide' , key: 'esRoot' },
        { type: 'radio', label: 'es un radio', orientacion: 'horizontal', multiple: true , key: 'esRadio', items: [
            { label:'Lunes', id: '1' },
            { label:'Martes', id: '2' },
            { label:'Miercoles', id: '3' },
            { label:'Jueves', id: '4' },
            { label:'Viernes', id: '5' },
            { label:'Sabado', id: '6' },
            { label:'Domingo', id: '7' },

        ] },

    ];
```

```
<plex-button type="success" label="click me!" (click)="form.validate()"></plex-button>
<lib-form-builder #form [template]="template" (change)="onInputChange($event)" [initial]="init">
</lib-form-builder>
```
