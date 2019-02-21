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


  // todo this helper have to by corrected becuse of change data format
  tableSearchOrder: function getSearchOrderFormatForTable(searchOrder) {
    let resultTable = []
    Object.keys(searchOrder).forEach(kido => {

      searchOrder[kido].forEach(searchEntry => {
        let item = {}
        item.gIndex = searchEntry.globalIndex
        item.cost = searchEntry.cost
        item[searchEntry.category] = searchEntry.item
        resultTable.push(item)
      })
    })
    resultTable.sort((entry1, entry2) => {return entry1.gIndex - entry2.gIndex})
    console.table(resultTable)
    return resultTable
  },

  tableResults: function getDailyQueryResults(bestSolution){
    if(bestSolution.solution){
        let hourArr = bestSolution.solution.hours
        let resultArr = []
        hourArr.forEach(hour => {
            hour.trainingsDetails.forEach((training, i) => {
                let hourObject = {}
                if(i === 0){
                    hourObject.HOUR = hour.hour
                }
                if(i < hour.trainer.length){
                    hourObject.TRAINER = hour.trainer[i]
                }
                hourObject.KIDO = training.kidName
                hourObject.HORSO = training.horse
                resultArr.push(hourObject)
            })
            if(hour.trainer.length > hour.trainingsDetails.length){
                resultArr.push({TRAINER: '...'})
            }
        })
        console.table(resultArr)
    }
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

