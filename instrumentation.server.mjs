import * as Sentry from '@sentry/remix';

Sentry.init({
  dsn: 'https://02d929e63bbf370a9e7735ce4d4bf265@o4509666331131904.ingest.de.sentry.io/4509666333032528',
  tracesSampleRate: 1,
});
