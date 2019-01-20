const categories = ['best', 'nice', 'isok', 'limp', 'excl']

module.exports = {

    tablePreferences: function getTableFormatForPreferences(kidos) {
        let resultTable = []
        categories.forEach(category => {
            let categoryEntry = {}
            kidos.forEach(kido => {
                categoryEntry[kido.name] = getHorsosFromCategory(category, kido)
            })
            resultTable.push(categoryEntry)
        })
        console.table(resultTable)
        return resultTable
    },

    tableSearchOrder: function getSearchOrderFormatForTable(searchOrder) {
        let resultTable = []
        let avaKids = Object.keys(searchOrder)
        searchOrder.forEach(searchEntry => {
            resultTable.push(getSingleSearchOrderRow(searchEntry, avaKids))
        })
        console.table(resultTable)
        return resultTable
    }

}


function getHorsosFromCategory(catName, kido) {
    let result = {}
    Object.keys(kido.prefs).forEach(pref => {
        if (catName === pref) {
            if (kido.prefs[catName]) {
                result = kido.prefs[catName].join(',')
            }
        }
    })
    return result
}

function getSingleSearchOrderRow(searchEntry, avaKids) {
    let row = {}
    avaKids.forEach(kid => {
        row.penalty = searchEntry.penalty
        if (searchEntry.kido === kid) {
            row[kid] = searchEntry.horso
        }
    })
    return row
}
