export interface ILocalidad{
    _id: String,
    nombre: String,
    provincia: {
            id: String,
            nombre: String
        }
}