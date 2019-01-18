/**
 * @author [Double]
 * @email [2637309949@qq.com]
 * @create date 2019-01-05 14:31:34
 * @modify date 2019-01-05 14:31:34
 * @desc [mongoose hooksUtils]
 */
const is = require('is')

module.exports = {
  popModel (query, arrayStr) {
    if (is.array(arrayStr) && arrayStr.length > 0) {
      return arrayStr
        .filter(x => !!x)
        .reduce((acc, curr) => query.populate(curr), query)
    } else {
      return query
    }
  },
  toPopulate (str, sem = ',') {
    if (!str || !str.trim()) return []
    return str
      .trim()
      .split(sem)
      .filter(x => !!x)
      .map(x => x.trim())
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
    return str
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
  }
}
