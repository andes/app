export interface ILocalidad{
    _id: String,
    nombre: String,
    provincia: {
            _id: String,
            nombre: String
        }
}