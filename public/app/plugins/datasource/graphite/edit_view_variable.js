define([
  'angular',
  'jquery'
],
function(angular, $) {
  'use strict';

  angular
    .module('grafana.directives')
    .directive('editDataviewValue', function() {
      return {
        restrict: 'A',
        link: function ($scope, elem) {
          var $elem = $(elem);
          var $input = $elem.next();
          var ctrl = $scope.ctrl;

          $elem.click(function(event) {
              event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
              console.log(ctrl);
              ctrl.queryCtrl.dataview.editing = true;
              setTimeout(function() {$input.focus();},200);
              console.log($elem);
              console.log($input);
            });
        }
      };
    });
});
