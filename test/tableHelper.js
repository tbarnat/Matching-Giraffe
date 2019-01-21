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
    Object.keys(searchOrder).forEach(kido => {

      searchOrder[kido].forEach(searchEntry => {
        let item = {}
        item.penalty = searchEntry.penalty
        item[searchEntry.kido] = searchEntry.horso
        resultTable.push(item)
      })
    })
    resultTable.sort((entry1, entry2) => {return entry1.penalty - entry2.penalty})
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

