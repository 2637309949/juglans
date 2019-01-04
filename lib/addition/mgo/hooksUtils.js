const is = require('is')

module.exports = {
  popModel (query, arrayStr) {
    if (is.array(arrayStr) && arrayStr.length > 0) {
      return arrayStr.reduce((acc, curr) => {
        if (is.string(curr)) {
          return query.populate(curr)
        }
        return query
      }, query)
    } else {
      return query
    }
  },
  toPopulate (str, sem = ',') {
    if (!str || !str.trim()) return {}
    const peObj = str
      .trim()
      .split(sem)
      .filter(x => !!x)
      .map(x => x.trim())
    return peObj
  },
  toProject (str, sem = ',') {
    if (!str || !str.trim()) return {}
    const projObj = str
      .trim()
      .split(sem)
      .filter(x => !!x)
      .map(x => x.trim())
      .reduce((acc, curr) => {
        let stat = 1
        if (curr.startsWith('-')) {
          curr = curr.substr(1)
          stat = 0
        }
        acc[curr] = stat
        return acc
      }, {})
    return projObj
  },
  toCond (str) {
    try {
      if (is.string(str)) {
        return JSON.parse(decodeURIComponent(str))
      }
      return {}
    } catch (error) {
      console.error('parse cond error!')
      throw error
    }
  },
  toSort (str, sem = ',') {
    if (!str || !str.trim()) return {}
    const sortObj = str
      .trim()
      .split(sem)
      .filter(x => !!x)
      .map(x => x.trim())
      .reduce((acc, curr) => {
        let order = 1
        if (curr.startsWith('-')) {
          curr = curr.substr(1)
          order = -1
        }
        acc[curr] = order
        return acc
      }, {})
    return sortObj
  }
}
