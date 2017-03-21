define({
  allViews: {
    avg: {name: 'average', firstDisplayed: 'avg'},
    sum: {name: 'sum', firstDisplayed: 'sum'},
    sumX: {name: 'sum per X seconds', variable: 60, firstDisplayed: 'sum'},
    min: {name: 'minimum', firstDisplayed: 'min'},
    max: {name: 'maximum', firstDisplayed: 'max'},
    obvs: {name: 'observations', firstDisplayed: 'obvs'},
    sumrate: {name: 'sum per second', firstDisplayed: 'sumrate'},
    obvsrate: {name: 'observations per second', firstDisplayed: 'obvsrate'},
    pctX: {name: 'percentile', variable: 90, lastDisplayed: 'pct'}
  },

  viewRender: function(view) {
    'use strict';
    return (view.firstDisplayed || '') + (view.variable || '') + (view.lastDisplayed || '');
  }

});