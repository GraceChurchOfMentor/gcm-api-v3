# Grace Church of Mentor Public API, Version 3

Replaces older, server-dependent API versions with backward-compatible implementations that run on Azure Cloud Functions.

## Available Endpoints
- CCB Events (HTML implementation, based on v1)
- CCB Events Calendar (JSON implementation, based on v2)
- BoxCast Live Stream Countdown (based on v2)

## Known Issues
### CCB Events
- JSON implementation is as yet unfinished.
- Need to implement `timeframe` query parameter
- Need to implement bare-bones replacement for PHP Carbon library's natural-language date parsing, as used in `dateStart` and `dateEnd` query parameters.