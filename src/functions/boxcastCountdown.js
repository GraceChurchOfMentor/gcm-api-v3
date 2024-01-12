const { app } = require('@azure/functions')
const BoxCastSDK = require('@boxcast/boxcast-sdk-js/node')

const config = {
    boxcastApiEndpoint: 'https://rest.boxcast.com'
}

const getBroadcast = async channelId => {
    if ( ! channelId) return false

    const { api } = new BoxCastSDK()
    const result = await api.broadcasts.list(channelId, {
        q: 'timeframe:relevant',
        s: '-starts_at',
        l: 1
    })

    if ( ! result.data[0]) return false

    const { id, name, starts_at, stops_at, timeframe } = result.data[0]

    return { id, name, starts_at, stops_at, timeframe }
}

const returnResult = async result => {
    return {
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(result)
    }
}

app.http('boxcastCountdown', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`)

        const channelId = request.query.get('channelId')
        if ( ! channelId) {
            return returnResult({
                status: 'error',
                error: 'Please specify channelId.'
            })
        }

        const details = await getBroadcast(channelId)
        if ( ! details) {
            return returnResult({
                status: 'error',
                error: 'Could not retrieve data. Try again later.'
            })
        }

        return returnResult({
            status: 'success',
            channelId,
            details
        })
    }
})
