angular.module('starter.directives', [])

.directive('myDirective', function(Gesture) {
  return {
    // Other directive stuff ...

    link: function($scope, $element, $attr) {
      var handleDrag = function(e) {
        // Access e.gesture for gesture related information
        console.log('Drag: ', e.gesture.touches[0].pageX, e.gesture.touches[0].pageY, e.gesture.deltaX, e.gesture.deltaY);
      };

      var dragGesture = Gesture.on('drag', handleDrag, $element);

      $scope.$on('$destroy', function() {
        // Unbind drag gesture handler
        Gesture.off(dragGesture, 'drag', handleDrag);
      });
    }
  }
});