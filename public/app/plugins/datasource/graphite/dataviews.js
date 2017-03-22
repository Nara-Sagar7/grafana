define(function() {
  'use strict';

  var allViews = {
    avg: {name: 'average', variable: '', firstDisplayed: 'avg', editing: false},
    sum: {name: 'sum', variable: '', firstDisplayed: 'sum', editing: false},
    sumX: {name: 'sum per X seconds', variable: '60', firstDisplayed: 'sum', editing: false},
    min: {name: 'minimum', variable: '', firstDisplayed: 'min', editing: false},
    max: {name: 'maximum', variable: '', firstDisplayed: 'max', editing: false},
    obvs: {name: 'observations', variable: '', firstDisplayed: 'obvs', editing: false},
    sumrate: {name: 'sum per second', variable: '', firstDisplayed: 'sumrate', editing: false},
    obvsrate: {name: 'observations per second', variable: '', firstDisplayed: 'obvsrate', editing: false},
    pctX: {name: 'percentile', variable: '90', lastDisplayed: 'pct', editing: false}
  };

  return {
    viewRender: function(view) {
      return (view.firstDisplayed || '') + (view.variable || '') + (view.lastDisplayed || '');
    },

    getAllViews: function() {
      return allViews;
    }
  };
});
