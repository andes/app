import { Profesional } from '../modelos/profesional';

export const PROFESIONALES: Profesional[] = [
    {
        id: 3121,
        documento: '31359294',
        activo: false,
        nombre: 'Walter Juan',
        apellido: 'Molini',
        contacto: [{
            tipo: 'Mail',
            valor: 'medico@mail.org.ar',
            ranking: 237, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            ultimaActualizacion: 'Miércoles 11/03/2021 - 11:32 hs.',
            activo: true,
        }],
        sexo: 'masculino',
        genero: 'masculino', // identidad autopercibida
        fechaNacimiento: '23/11/1947', // Fecha Nacimiento
        fechaFallecimiento: 'Date',
        direccion: [{
            valor: 'texto',
            codigoPostal: 'texto',
            ubicacion: 'texto',
            ranking: 4321,
            geoReferencia: {
                type: [4321], // [<longitude>, <latitude>]
                index: '2d' // create the geospatial index
            },
            ultimaActualizacion: 'Date',
            activo: false
        }],
        estadoCivil: 'casado',
        foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6kC2G5mah771aAk-RG2zh10844QBCW9NHkZhE8zofvVkB_wAA&s',
        rol: 'Jefe de terapia intermedia de adultos', // Ejemplo Jefe de Terapia intensiva
        especialidad: [{ // El listado de sus especialidades
            id: '23tgwda34fr',
            nombre: 'Consulta general de medicina'
        }],
        matriculas: [{
            numero: 4321,
            descripcion: 'Licenciado en medicina',
            fechaInicio: '17/09/2020',
            fechaVencimiento: '17/09/2030',
            activo: false
        }],
        profesionalMatriculado: true,
    },
    {
        id: 6439,
        documento: '2454543',
        activo: false,
        nombre: 'María Laura',
        apellido: 'Monteverde',
        contacto: [{
            tipo: 'Mail',
            valor: 'medico@mail.org.ar',
            ranking: 237, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            ultimaActualizacion: 'Miércoles 11/03/2021 - 11:32 hs.',
            activo: true,
        }],
        sexo: 'femenino',
        genero: 'femenino', // identidad autopercibida
        fechaNacimiento: '05/09/1974', // Fecha Nacimiento
        fechaFallecimiento: 'Date',
        direccion: [{
            valor: 'texto',
            codigoPostal: 'texto',
            ubicacion: 'texto',
            ranking: 4321,
            geoReferencia: {
                type: [4321], // [<longitude>, <latitude>]
                index: '2d' // create the geospatial index
            },
            ultimaActualizacion: 'Date',
            activo: false
        }],
        estadoCivil: 'soltera',
        foto: 'https://library.kissclipart.com/20180901/krw/kissclipart-user-thumbnail-clipart-user-lorem-ipsum-is-simply-bfcb758bf53bea22.jpg',
        rol: 'Jefe de pediatría', // Ejemplo Jefe de Terapia intensiva
        especialidad: [{ // El listado de sus especialidades
            id: '23tgwda34fr',
            nombre: 'Consulta pediátrica'
        }],
        matriculas: [{
            numero: 4321,
            descripcion: 'Licenciado en medicina',
            fechaInicio: '17/09/2019',
            fechaVencimiento: '17/09/2029',
            activo: false
        }],
        profesionalMatriculado: true,
    },
    {
        id: 5653,
        documento: '2454543',
        activo: false,
        nombre: 'Mónica Patricia',
        apellido: 'Cifuentes',
        contacto: [{
            tipo: 'Mail',
            valor: 'medico@mail.org.ar',
            ranking: 237, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            ultimaActualizacion: 'Miércoles 11/03/2021 - 11:32 hs.',
            activo: true,
        }],
        sexo: 'femenino',
        genero: 'femenino', // identidad autopercibida
        fechaNacimiento: '05/09/1974', // Fecha Nacimiento
        fechaFallecimiento: 'Date',
        direccion: [{
            valor: 'texto',
            codigoPostal: 'texto',
            ubicacion: 'texto',
            ranking: 4321,
            geoReferencia: {
                type: [4321], // [<longitude>, <latitude>]
                index: '2d' // create the geospatial index
            },
            ultimaActualizacion: 'Date',
            activo: false
        }],
        estadoCivil: 'soltera',
        foto: 'https://http2.mlstatic.com/fotos-4x4-3x3-5x5-varios-embajada-pasaporte-6-fotos-carnet-D_NQ_NP_990542-MLA31020537999_062019-O.webp',
        rol: 'Jefe de pediatría', // Ejemplo Jefe de Terapia intensiva
        especialidad: [{ // El listado de sus especialidades
            id: '23tgwda34fr',
            nombre: 'Consulta pediátrica'
        }],
        matriculas: [{
            numero: 4321,
            descripcion: 'Licenciado en medicina',
            fechaInicio: '17/09/2019',
            fechaVencimiento: '17/09/2029',
            activo: false
        }],
        profesionalMatriculado: true,
    },
    {
        id: 1246,
        documento: '2454543',
        activo: false,
        nombre: 'Alejandra Gabriela',
        apellido: 'Siracussi',
        contacto: [{
            tipo: 'Mail',
            valor: 'medico@mail.org.ar',
            ranking: 237, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            ultimaActualizacion: 'Miércoles 11/03/2021 - 11:32 hs.',
            activo: true,
        }],
        sexo: 'femenino',
        genero: 'femenino', // identidad autopercibida
        fechaNacimiento: '05/09/1974', // Fecha Nacimiento
        fechaFallecimiento: 'Date',
        direccion: [{
            valor: 'texto',
            codigoPostal: 'texto',
            ubicacion: 'texto',
            ranking: 4321,
            geoReferencia: {
                type: [4321], // [<longitude>, <latitude>]
                index: '2d' // create the geospatial index
            },
            ultimaActualizacion: 'Date',
            activo: false
        }],
        estadoCivil: 'soltera',
        foto: 'https://library.kissclipart.com/20180901/krw/kissclipart-user-thumbnail-clipart-user-lorem-ipsum-is-simply-bfcb758bf53bea22.jpg',
        rol: 'Jefe de pediatría', // Ejemplo Jefe de Terapia intensiva
        especialidad: [{ // El listado de sus especialidades
            id: '23tgwda34fr',
            nombre: 'Consulta pediátrica'
        }],
        matriculas: [{
            numero: 4321,
            descripcion: 'Licenciado en medicina',
            fechaInicio: '17/09/2019',
            fechaVencimiento: '17/09/2029',
            activo: false
        }],
        profesionalMatriculado: true,
    },
    {
        id: 3121,
        documento: '31359294',
        activo: false,
        nombre: 'Ernestina Fernanda',
        apellido: 'Molini',
        contacto: [{
            tipo: 'Mail',
            valor: 'medico@mail.org.ar',
            ranking: 237, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            ultimaActualizacion: 'Miércoles 11/03/2021 - 11:32 hs.',
            activo: true,
        }],
        sexo: 'masculino',
        genero: 'masculino', // identidad autopercibida
        fechaNacimiento: '23/11/1947', // Fecha Nacimiento
        fechaFallecimiento: 'Date',
        direccion: [{
            valor: 'texto',
            codigoPostal: 'texto',
            ubicacion: 'texto',
            ranking: 4321,
            geoReferencia: {
                type: [4321], // [<longitude>, <latitude>]
                index: '2d' // create the geospatial index
            },
            ultimaActualizacion: 'Date',
            activo: false
        }],
        estadoCivil: 'casado',
        foto: 'https://cdn10.bostonmagazine.com/wp-content/uploads/sites/2/2014/11/new-lead-docs.jpg',
        rol: 'Jefe de terapia intermedia de adultos', // Ejemplo Jefe de Terapia intensiva
        especialidad: [{ // El listado de sus especialidades
            id: '23tgwda34fr',
            nombre: 'Consulta general de medicina'
        }],
        matriculas: [{
            numero: 4321,
            descripcion: 'Licenciado en medicina',
            fechaInicio: '17/09/2020',
            fechaVencimiento: '17/09/2030',
            activo: false
        }],
        profesionalMatriculado: true,
    },
    {
        id: 6439,
        documento: '2454543',
        activo: false,
        nombre: 'María Laura',
        apellido: 'Monteverde',
        contacto: [{
            tipo: 'Mail',
            valor: 'medico@mail.org.ar',
            ranking: 237, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            ultimaActualizacion: 'Miércoles 11/03/2021 - 11:32 hs.',
            activo: true,
        }],
        sexo: 'femenino',
        genero: 'femenino', // identidad autopercibida
        fechaNacimiento: '05/09/1974', // Fecha Nacimiento
        fechaFallecimiento: 'Date',
        direccion: [{
            valor: 'texto',
            codigoPostal: 'texto',
            ubicacion: 'texto',
            ranking: 4321,
            geoReferencia: {
                type: [4321], // [<longitude>, <latitude>]
                index: '2d' // create the geospatial index
            },
            ultimaActualizacion: 'Date',
            activo: false
        }],
        estadoCivil: 'soltera',
        foto: 'https://library.kissclipart.com/20180901/krw/kissclipart-user-thumbnail-clipart-user-lorem-ipsum-is-simply-bfcb758bf53bea22.jpg',
        rol: 'Jefe de pediatría', // Ejemplo Jefe de Terapia intensiva
        especialidad: [{ // El listado de sus especialidades
            id: '23tgwda34fr',
            nombre: 'Consulta pediátrica'
        }],
        matriculas: [{
            numero: 4321,
            descripcion: 'Licenciado en medicina',
            fechaInicio: '17/09/2019',
            fechaVencimiento: '17/09/2029',
            activo: false
        }],
        profesionalMatriculado: true,
    },
    {
        id: 5653,
        documento: '2454543',
        activo: false,
        nombre: 'Mónica Patricia',
        apellido: 'Cifuentes',
        contacto: [{
            tipo: 'Mail',
            valor: 'medico@mail.org.ar',
            ranking: 237, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            ultimaActualizacion: 'Miércoles 11/03/2021 - 11:32 hs.',
            activo: true,
        }],
        sexo: 'femenino',
        genero: 'femenino', // identidad autopercibida
        fechaNacimiento: '05/09/1974', // Fecha Nacimiento
        fechaFallecimiento: 'Date',
        direccion: [{
            valor: 'texto',
            codigoPostal: 'texto',
            ubicacion: 'texto',
            ranking: 4321,
            geoReferencia: {
                type: [4321], // [<longitude>, <latitude>]
                index: '2d' // create the geospatial index
            },
            ultimaActualizacion: 'Date',
            activo: false
        }],
        estadoCivil: 'soltera',
        foto: 'https://http2.mlstatic.com/fotos-4x4-3x3-5x5-varios-embajada-pasaporte-6-fotos-carnet-D_NQ_NP_990542-MLA31020537999_062019-O.webp',
        rol: 'Jefe de pediatría', // Ejemplo Jefe de Terapia intensiva
        especialidad: [{ // El listado de sus especialidades
            id: '23tgwda34fr',
            nombre: 'Consulta pediátrica'
        }],
        matriculas: [{
            numero: 4321,
            descripcion: 'Licenciado en medicina',
            fechaInicio: '17/09/2019',
            fechaVencimiento: '17/09/2029',
            activo: false
        }],
        profesionalMatriculado: true,
    },
    {
        id: 1246,
        documento: '2454543',
        activo: false,
        nombre: 'Alejandra Gabriela',
        apellido: 'Siracussi',
        contacto: [{
            tipo: 'Mail',
            valor: 'medico@mail.org.ar',
            ranking: 237, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
            ultimaActualizacion: 'Miércoles 11/03/2021 - 11:32 hs.',
            activo: true,
        }],
        sexo: 'femenino',
        genero: 'femenino', // identidad autopercibida
        fechaNacimiento: '05/09/1974', // Fecha Nacimiento
        fechaFallecimiento: 'Date',
        direccion: [{
            valor: 'texto',
            codigoPostal: 'texto',
            ubicacion: 'texto',
            ranking: 4321,
            geoReferencia: {
                type: [4321], // [<longitude>, <latitude>]
                index: '2d' // create the geospatial index
            },
            ultimaActualizacion: 'Date',
            activo: false
        }],
        estadoCivil: 'soltera',
        foto: 'https://library.kissclipart.com/20180901/krw/kissclipart-user-thumbnail-clipart-user-lorem-ipsum-is-simply-bfcb758bf53bea22.jpg',
        rol: 'Jefe de pediatría', // Ejemplo Jefe de Terapia intensiva
        especialidad: [{ // El listado de sus especialidades
            id: '23tgwda34fr',
            nombre: 'Consulta pediátrica'
        }],
        matriculas: [{
            numero: 4321,
            descripcion: 'Licenciado en medicina',
            fechaInicio: '17/09/2019',
            fechaVencimiento: '17/09/2029',
            activo: false
        }],
        profesionalMatriculado: true,
    },
]