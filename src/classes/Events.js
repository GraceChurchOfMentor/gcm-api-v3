import { readFileSync } from 'node:fs';
import { resolve } from 'path';
import Mustache from 'mustache';
import { DateTime } from "luxon";

import Common from './Common.js';

const formatTimeString = dt => {
  const hour = dt.toFormat('h')
  const minutes = dt.toFormat('mm') !== '00' ? ':' + dt.toFormat('mm') : ''
  const meridiem = dt.toFormat('a') === 'AM' ? 'a.m.' : 'p.m.'

  return `${hour}${minutes} ${meridiem}`
}

const formats = {
  html: (events, request, params, args) => {
    // reformat start and end times to be more human-readable
    events.map(event => {
      event.start_time = formatTimeString(DateTime.fromISO(event.start_time))
      event.end_time = formatTimeString(DateTime.fromISO(event.end_time))
    })

    // group events by date for hierarchical display, limiting to specified number of items
    const eventsGrouped = Common.groupItemsByProperty(events, 'date', 'events').slice(0, args.count)

    // reformat date group heading to be more human-readable
    eventsGrouped.map(g => {
      const dayOfWeek = DateTime.fromISO(g.date).toFormat('cccc')
      const month = DateTime.fromISO(g.date).toFormat('LLL.')
      const day = DateTime.fromISO(g.date).toFormat('d')
      const suffix = (() => {
        if (day === '11' || day === '12' || day === '13') return 'th'
        let lastDigit = day.toString().slice(-1)
        switch (lastDigit) {
          case '1': return 'st'
          case '2': return 'nd'
          case '3': return 'rd'
          default:  return 'th'
        }
      })()

      g.date = `${dayOfWeek}, ${month} ${day}${suffix}`
    })

    try {
      const eventsTemplate = readFileSync(resolve(__dirname, '../templates/html/events.html'), 'utf8')
      const eventsRendered = Mustache.render(eventsTemplate, { dates: eventsGrouped })

      const eventsWrapTemplate = readFileSync(resolve(__dirname, '../templates/html/events-wrap.html'), 'utf8')
      const eventsWrapRendered = Mustache.render(eventsWrapTemplate, { events: eventsRendered })

      return {
        headers: { 'content-type': 'text/html' },
        body: args.trim ? eventsRendered : eventsWrapRendered
      }
    } catch (err) {
      return {
        headers: { 'content-type': 'application/json' },
        body: { error: console.error(err) }
      }
    }
  },
  xml: (events, request, params, args) => {
    return {
      headers: { 'content-type': 'application/xml' },
      body: '<?xml version="1.0" encoding="UTF-8"?><message>XML not implemented in this version.</message>'
    }
  },
  json: (events, request, params, args) => {
    return {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        request: {
          dateStart: request.query.get('dateStart'),
          dateEnd: request.query.get('dateEnd')
        },
        parsed: {
          dateStart: params.dateStart.toISODate(),
          dateEnd: params.dateEnd.toISODate()
        },
        count: events.length,
        events
      })
    }
  }
}

class Events {
  static filterEvents(events, args) {
    if (args.featured) {
      events = events.filter(ev => ev.event_name.startsWith('*'))
    }

    if (args.group) {
      events = events.filter(ev => {
        let arg = args.group.toLowerCase()
        let groups = arg.split('|')
        let group = Common.normalizeString(ev.group_name).toLowerCase()

        console.log(groups, group)
        return groups.includes(group)
      })
    }

    events.map(event => {
      if (event.event_name.startsWith('*')) {
        event.event_name = event.event_name.slice(1)
      }
    })

    return events
  }

  static formatEvents(events, request, params, args, format) {
    format = formats.hasOwnProperty(format) ? formats[format] : formats.html

    return format(events, request, params, args)
  }
}

export default Events