class Common {
  static normalizeString(s) {
    // remove everything but alphanumerics and spaces
    const re = /[^A-Za-z0-9 ]/
    let replaced = s.replace(re, '')

    // split words into array, removing empty strings
    let words = replaced.split(' ').filter(word => word !== '')

    //
    let normalized = words
      .map(word => `${word[0].toUpperCase()}${word.substring(1).toLowerCase()}`)
      .join('')

    return normalized
  }

  static groupItemsByProperty(items, propertyName, itemsPropertyName) {
    const groups = []

    items.forEach(item => {
      let group = groups.find(el => el[propertyName] === item[propertyName])

      if (typeof group === 'undefined') {
        group = {}
        group[propertyName] = item[propertyName]
        group[itemsPropertyName] = []
        groups.push(group)
      }

      group[itemsPropertyName].push(item)
    })

    return groups
  }
}

module.exports = Common