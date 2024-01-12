const { app } = require('@azure/functions')
const { DateTime } = require("luxon")
const Ccb = require('../classes/Ccb')
const { formatEvents } = require('../classes/Events')
const ccbConfig = require('../config/ccb')

app.http('ccbEvents', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`)

        const dateStart = request.query.get('date_start') ? DateTime.fromISO(request.query.get('date_start')) : DateTime.now()
        const dateEnd = request.query.get('date_end') ? DateTime.fromISO(request.query.get('date_end')) : dateStart.plus(ccbConfig.defaultTimeframe)
        const format = request.query.get('format') ? request.query.get('format') : 'html'

        const { apiEndpoint, apiUsername, apiPassword } = ccbConfig
        const ccb = new Ccb(apiEndpoint, apiUsername, apiPassword)

        const args = {
            'featured': request.query.get('featured'),
            'count': request.query.get('count') || ccbConfig.defaultCount,
            'group': request.query.get('group'),
            'search': request.query.get('search'),
            'show_details': request.query.get('show_details'),
            'trim': request.query.get('trim')
        }

        let events = await ccb.fetchEvents(dateStart, dateEnd, args)

        return formatEvents(events, request, { dateStart, dateEnd }, args, format)
    }
})
