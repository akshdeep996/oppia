// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Directive for the ItemSelectionInput interaction.
 *
 * IMPORTANT NOTE: The naming convention for customization args that are passed
 * into the directive is: the name of the parameter, followed by 'With',
 * followed by the name of the arg.
 */

oppia.directive('oppiaInteractiveItemSelectionInput', [
  'HtmlEscaperService', 'itemSelectionInputRulesService',
  'UrlInterpolationService',
  function(
      HtmlEscaperService, itemSelectionInputRulesService,
      UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {
        onSubmit: '&',
        // This should be called whenever the answer changes.
        setAnswerValidity: '&'
      },
      templateUrl: UrlInterpolationService.getExtensionResourceUrl(
        '/interactions/ItemSelectionInput/directives/' +
        'item_selection_input_interaction_directive.html'),
      controller: [
        '$scope', '$attrs', 'WindowDimensionsService',
        'UrlService', 'EVENT_PROGRESS_NAV_SUBMITTED',
        function(
            $scope, $attrs, WindowDimensionsService,
            UrlService, EVENT_PROGRESS_NAV_SUBMITTED) {
          $scope.choices = HtmlEscaperService.escapedJsonToObj(
            $attrs.choicesWithValue);
          $scope.maxAllowableSelectionCount = (
            $attrs.maxAllowableSelectionCountWithValue);
          $scope.minAllowableSelectionCount = (
            $attrs.minAllowableSelectionCountWithValue);

          // The following is an associative array where the key is a choice
          // (html) and the value is a boolean value indicating whether the
          // choice was selected by the user (default is false).
          $scope.userSelections = {};

          for (var i = 0; i < $scope.choices.length; i++) {
            $scope.userSelections[$scope.choices[i]] = false;
          }

          $scope.displayCheckboxes = ($scope.maxAllowableSelectionCount > 1);

          // The following indicates that the number of answers is more than
          // maxAllowableSelectionCount.
          $scope.preventAdditionalSelections = false;

          // The following indicates that the number of answers is less than
          // minAllowableSelectionCount.
          $scope.notEnoughSelections = ($scope.minAllowableSelectionCount > 0);
          $scope.setAnswerValidity({
            answerValidity: !$scope.notEnoughSelections
          });

          $scope.onToggleCheckbox = function() {
            $scope.newQuestion = false;
            $scope.selectionCount = Object.keys($scope.userSelections).filter(
              function(obj) {
                return $scope.userSelections[obj];
              }
            ).length;
            $scope.preventAdditionalSelections = (
              $scope.selectionCount >= $scope.maxAllowableSelectionCount);
            $scope.notEnoughSelections = (
              $scope.selectionCount < $scope.minAllowableSelectionCount);
            $scope.setAnswerValidity({
              answerValidity: !$scope.notEnoughSelections
            });
          };

          $scope.submitMultipleChoiceAnswer = function(index) {
            $scope.userSelections[$scope.choices[index]] = true;
            $scope.submitAnswer($scope.userSelections);
          };

          $scope.submitAnswer = function() {
            var answers = Object.keys($scope.userSelections).filter(
              function(obj) {
                return $scope.userSelections[obj];
              }
            );

            $scope.onSubmit({
              answer: answers,
              rulesService: itemSelectionInputRulesService
            });
          };

          $scope.$on(EVENT_PROGRESS_NAV_SUBMITTED, $scope.submitAnswer);
        }
      ]
    };
  }
]);

oppia.directive('oppiaResponseItemSelectionInput', [
  'HtmlEscaperService', 'UrlInterpolationService',
  function(HtmlEscaperService, UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: UrlInterpolationService.getExtensionResourceUrl(
        '/interactions/ItemSelectionInput/directives/' +
        'item_selection_input_response_directive.html'),
      controller: ['$scope', '$attrs', function($scope, $attrs) {
        $scope.answer = HtmlEscaperService.escapedJsonToObj($attrs.answer);
      }]
    };
  }
]);

oppia.directive('oppiaShortResponseItemSelectionInput', [
  'HtmlEscaperService', 'UrlInterpolationService',
  function(HtmlEscaperService, UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: UrlInterpolationService.getExtensionResourceUrl(
        '/interactions/ItemSelectionInput/directives/' +
        'item_selection_input_short_response_directive.html'),
      controller: ['$scope', '$attrs', function($scope, $attrs) {
        $scope.answer = HtmlEscaperService.escapedJsonToObj($attrs.answer);
      }]
    };
  }
]);

oppia.factory('itemSelectionInputRulesService', ['$filter', function($filter) {
  return {
    Equals: function(answer, inputs) {
      var normalizedAnswer = $filter('removeDuplicatesInArray')(answer);
      var normalizedInput = $filter('removeDuplicatesInArray')(inputs.x);
      return normalizedAnswer.length === normalizedInput.length &&
          normalizedAnswer.every(function(val) {
            return normalizedInput.indexOf(val) !== -1;
          });
    },
    ContainsAtLeastOneOf: function(answer, inputs) {
      var normalizedAnswer = $filter('removeDuplicatesInArray')(answer);
      var normalizedInput = $filter('removeDuplicatesInArray')(inputs.x);
      return normalizedAnswer.some(function(val) {
        return normalizedInput.indexOf(val) !== -1;
      });
    },
    // TODO(wxy): migrate the name of this rule to OmitsAtLeastOneOf, keeping in
    // sync with the backend migration of the same rule.
    DoesNotContainAtLeastOneOf: function(answer, inputs) {
      var normalizedAnswer = $filter('removeDuplicatesInArray')(answer);
      var normalizedInput = $filter('removeDuplicatesInArray')(inputs.x);
      return normalizedInput.some(function(val) {
        return normalizedAnswer.indexOf(val) === -1;
      });
    }
  };
}]);
