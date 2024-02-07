import mixpanel from 'mixpanel-browser';

import environment from '../app/env';

mixpanel.init(environment.analytics.mixpanelToken, { debug: true, track_pageview: true, persistence: 'localStorage' });
