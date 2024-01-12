const { filterEvents } = require('../classes/Events')
const { XMLParser } = require("fast-xml-parser");

class Ccb {
  constructor(endpoint, username, password) {
    this.endpoint = endpoint
    this.username = username
    this.password = password
  }

  async fetchEvents(dateStart, dateEnd, args) {
    if (dateStart.invalid) {
      return { error: `Invalid \`dateStart\` value (${dateStart.invalidReason}): ${dateStart.invalidExplanation}` }
    }
    if (dateEnd.invalid) {
      return { error: `Invalid \`dateEnd\` value (${dateEnd.invalidReason}): ${dateEnd.invalidExplanation}` }
    }
    if (typeof args === "undefined") {
      args = {}
    }

    const response = await this.#call('public_calendar_listing', {
      'date_start': dateStart.toISODate(),
      'date_end': dateEnd.toISODate()
    })

    if ( ! response.ok) {
      return { error: `HTTP ${response.status} error: ${response.statusText}` }
    }

    const xml = await response.text()
    const parser = new XMLParser();
    let data = parser.parse(xml);

    if ( ! data.ccb_api) {
      return { error: `Error parsing XML response. Try again later.` }
    }

    if ( data.ccb_api.response.errors) {
      return { error: `Error(s) returned from upstream API`, details: data.ccb_api.response.errors }
    }

    let events = filterEvents(data.ccb_api.response.items.item, args)

    return events
  }

  async #call(srv, params) {
    const authHeaderString = btoa(`${this.username}:${this.password}`)
    const query = new URLSearchParams({ srv, ...params })
    const url = `${this.endpoint}?${query}`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${authHeaderString}`
      }
    })
    return response
  }
}

module.exports = Ccb