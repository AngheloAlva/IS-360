// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
	dsn: "https://d2f8bb0ea5fe6cffb978dcd1f3a95f9d@o4511338883383296.ingest.us.sentry.io/4511338894852096",

	integrations: [Sentry.replayIntegration()],

	tracesSampleRate: 0,

	enableLogs: false,

	replaysSessionSampleRate: 0,

	replaysOnErrorSampleRate: 1.0,

	sendDefaultPii: false,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
