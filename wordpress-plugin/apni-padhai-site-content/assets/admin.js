(function ($) {
  'use strict';

  function bindImageFields() {
    $(document).off('click.apsc', '.apsc-image-upload').on('click.apsc', '.apsc-image-upload', function (e) {
      e.preventDefault();
      var $field = $(this).closest('.apsc-image-field');
      var frame = wp.media({
        title: 'Choose an image',
        multiple: false,
        library: { type: 'image' },
      });

      frame.on('select', function () {
        var attachment = frame.state().get('selection').first().toJSON();
        var url = attachment.url;
        if (attachment.sizes && (attachment.sizes.large || attachment.sizes.medium)) {
          url = (attachment.sizes.large || attachment.sizes.medium).url;
        }
        $field.find('input[type="hidden"]').val(url);
        $field.find('img.apsc-preview').attr('src', url).show();
      });

      frame.open();
    });

    $(document).off('click.apsc', '.apsc-image-remove').on('click.apsc', '.apsc-image-remove', function (e) {
      e.preventDefault();
      var $field = $(this).closest('.apsc-image-field');
      $field.find('input[type="hidden"]').val('');
      $field.find('img.apsc-preview').attr('src', '').hide();
    });
  }

  if (window.wp && window.wp.media) {
    bindImageFields();
  } else {
    $(document).ready(bindImageFields);
  }
})(jQuery);
