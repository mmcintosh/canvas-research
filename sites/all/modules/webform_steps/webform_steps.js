(function($) {

Drupal.behaviors.webform_steps = {};
Drupal.behaviors.webform_steps.attach = function(context, settings) {

$('.webform-steps-wrapper', context).each(function() {
  var $this = $(this);
  var ajax = $this.parents('form').find('[name="webform_ajax_wrapper_id"]').length > 0;

  $this.click(function(event) {
    var $target = $(event.target);
    if ($target.is('span')) {
      var $input = $target.find('input');
      if ($input.is(':enabled')) {
        if (ajax) {
          $input.mousedown();
        }
        else {
          $input.click();
        }
      };
    }
  });
});

}
})(jQuery);
