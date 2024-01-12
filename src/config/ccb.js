export default {
  apiEndpoint: process.env['CCB_API_ENDPOINT'] || '',
  apiUsername: process.env['CCB_API_USERNAME'] || '',
  apiPassword: process.env['CCB_API_PASSWORD'] || '',
  defaultTimeframe: { months: 1 },
  defaultCount: 4,
}