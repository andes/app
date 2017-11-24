export function clonarObjeto(objeto: Object) {
    return <any> JSON.parse(JSON.stringify(objeto));
}
