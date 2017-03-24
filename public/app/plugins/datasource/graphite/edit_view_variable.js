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
          var ctrl = $scope.ctrl.queryCtrl;

          $elem.click(function() {

              $input.css('width', ($elem.width() + 10) + 'px');
              $input.show();
              $input.focus();
              $input.select();

              $elem.hide();
            });

          $input.blur(function() {
            $elem.show();
            $input.hide();
            $scope.$apply();
            ctrl.targetChanged();
          });
        }
      };
    });
});
