export function clonarObjeto(objeto: object) {
    return <any> JSON.parse(JSON.stringify(objeto));
}
