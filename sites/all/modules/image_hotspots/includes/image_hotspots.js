(function($) {

  Drupal.behaviors.imageHotspotEdit = {
    attach: function(context, settings) {

      function deleteEmptyItems(hotspotData) {
        hotspotData.find('.image-hotspot-data-item').each(function() {
          if (typeof $(this).attr('x1') === 'undefined') {
            $(this).remove();
          }
        });
      }

      function collectDataItems(editContainer, hotspotDataDiv, hotspotImg) {
        // collect data from all items
        var coordInput = editContainer.find('.image-hotspot-coordinates input'),
          hotspotItems = hotspotDataDiv.find('.image-hotspot-data-item'),
          hotspotData = new Array();

        hotspotItems.each(function() {
          if ($(this).attr('x1')) {
            hotspotData.push({
              'title': $(this).find('.img-hotspot-title').val().replace(/"/g, '\''),
              'description': $(this).find('.img-hotspot-descr').val().replace(/"/g, '\''),
              'x1': Math.round(100 / (hotspotImg.width() / $(this).attr('x1'))),
              'x2': Math.round(100 / (hotspotImg.width() / $(this).attr('x2'))),
              'y1': Math.round(100 / (hotspotImg.height() / $(this).attr('y1'))),
              'y2': Math.round(100 / (hotspotImg.height() / $(this).attr('y2')))
            });
          }
        });
        if (hotspotData.length > 0) {
          coordInput.val($.toJSON(hotspotData));
        }
        else {
          coordInput.val('');
        }
      }

      $('.image-hotspot-edit:not(.with-jcrop)', context).each(function() {

        // main data
        var hotspotImg = $(this).find('.image-hotspot-img img'),
          jcrop = $.Jcrop(hotspotImg),
          hotspotInputs = $(this).find('.image-hotspot-inputs'),
          hotspotAddBtn = $(this).find('.image-hotspot-add'),
          hotspotDataDiv = $(this).find('.image-hotspot-data'),
          existHotspots = hotspotDataDiv.find('.image-hotspot-data-item'),
          editContainer = $(this);
        $(this).addClass('with-jcrop');

        // hotspots form
        if (existHotspots.length > 0) {
          hotspotDataDiv.find('.img-hotspot-data-wrapper').hide();
        }
        else {
          hotspotDataDiv.html(hotspotInputs.html());
        }
        hotspotDataDiv.append(hotspotAddBtn.html());

        // add another hotspot
        $(this).find('.img-hotspot-add').click(function() {
          deleteEmptyItems(hotspotDataDiv);
          hotspotDataDiv.find('.img-hotspot-data-wrapper').hide();
          $(this).before(hotspotInputs.html());
          jcrop.setSelect([0, 0, 0, 0]);
          jcrop.release();
          return false;
        });

        // save hotspots coordinates
        hotspotDataDiv.delegate('.img-hotspot-save', 'click', function() {
          // current item changes
          var selection = jcrop.tellSelect(),
            hotspotTitle = $(this).parent().find('.img-hotspot-title');

          if (hotspotTitle.val() === '') {
            alert(Drupal.t('Hotspot title field is required.'));
          }
          else if (selection.h > 0) {
            var hotspotItem = $(this).parent().parent();
            hotspotItem.attr({
              'x1': selection.x,
              'x2': selection.x2,
              'y1': selection.y,
              'y2': selection.y2
            });
            $(this).parent().hide().prev().text(hotspotTitle.val());
            jcrop.release();
            collectDataItems(editContainer, hotspotDataDiv, hotspotImg);
          }
          else {
            alert(Drupal.t('Please select an area on the image.'));
          }
          return false;
        });

        // select hotspot
        hotspotDataDiv.delegate('.img-hotspot-data-title', 'click', function() {
          var item = $(this).parent();
          jcrop.setSelect([item.attr('x1'), item.attr('y1'), item.attr('x2'), item.attr('y2')]);
          deleteEmptyItems(hotspotDataDiv);
          hotspotDataDiv.find('.img-hotspot-data-wrapper').hide();
          $(this).next().show();
          return false;
        });

        // remove hotspot
        hotspotDataDiv.delegate('.img-hotspot-remove', 'click', function() {
          $(this).parent().parent().remove();
          jcrop.release();
          collectDataItems(editContainer, hotspotDataDiv, hotspotImg);
          return false;
        });
      });
    }
  }

  Drupal.behaviors.imageHotspotView = {
    attach: function(context, settings) {

      if (settings.imageHotspots) {
        $('.image-hotspot:not(.init)', context).each(function() {
          $(this).addClass('init').parents('.field-item').wrapInner('<div class="image-hotspot-wrapper">');
          var imageId = $(this).attr('id').split('-'),
            fid = 'fid' + imageId[2],
            hotspots = eval('settings.imageHotspots.' + fid);

          if (hotspots) {
            var imgWidth = $(this).width(),
              imgHeight = $(this).height(),
              imageWrap = $(this).parent(),
              imageSrc = $(this).attr('src'),
              classIndex = 0,
              hotspotIndex = 0,
              hotspotTitles = '',
              comma = ', ';

            $.each(hotspots, function(i, hotspot) {
              if (i % 10 === 0) {
                classIndex = 0;
              }
              if (i === (hotspots.length - 1)) {
                comma = '';
              }
              classIndex++;
              hotspotIndex++;
              hotspotTitles += '<span class="hotspot-title" hotspot="' + hotspotIndex + '">' + hotspot.title + comma + '</span>';
              var hWidth = imgWidth / (100 / (hotspot.x2 - hotspot.x1)),
                hHeight = imgHeight / (100 / (hotspot.y2 - hotspot.y1)),
                hTop = Math.round(imgHeight / (100 / hotspot.y1)),
                hLeft = Math.round(imgWidth / (100 / hotspot.x1));
              // add hotspot item
              imageWrap.append('<div img-hotspot-title="' + hotspot.title + '" img-hotspot-descr="' + hotspot.description + '" class="img-hotspot-box" '
                + 'style="top: ' + hTop + 'px; left: ' + hLeft + 'px; width: ' + hWidth + 'px; height: ' + hHeight + 'px;">'
                + '<div class="img-hotspot-highlight hotspot-highlight-' + hotspotIndex + '" style="background-image: url(' + imageSrc + '); background-position: -' + hLeft + 'px -' + hTop + 'px;"></div>'
                + '<div class="img-hotspot img-hotspot-' + classIndex + '"></div></div>');
            });
            // titles after image
            $(this).parents('.image-hotspot-wrapper').append('<div class="hotspot-titles">' + hotspotTitles + '</div>');
            // overlay for highlighs
            $(this).after('<div style="width: ' + imgWidth + 'px; height: ' + imgHeight + 'px;" class="hotspot-overlay"></div>');
          }
        });
        // tooltips
        $('.img-hotspot-box', context).each(function() {
          var title = $(this).attr('img-hotspot-title'),
            descr = $(this).attr('img-hotspot-descr'),
            data = '<div class="img-hotspot-title">' + title + '</div>';
          if (descr !== '') {
            data += '<div class="img-hotspot-description">' + descr + '</div>';
          }
          $(this).tipTip({
            content: data,
            activation: 'hover',
            keepAlive: true
          });
        });
        // highlights
        $('.hotspot-title', context).hover(
          function() {
            var hotspotIndex = $(this).attr('hotspot'),
              wrapper = $(this).parents('.image-hotspot-wrapper'),
              hotspotHighlight = wrapper.find('.hotspot-highlight-' + hotspotIndex),
              overlay = wrapper.find('.hotspot-overlay');
            hotspotHighlight.show();
            overlay.show();
          },
          function() {
            var hotspotIndex = $(this).attr('hotspot'),
              wrapper = $(this).parents('.image-hotspot-wrapper'),
              hotspotHighlight = wrapper.find('.hotspot-highlight-' + hotspotIndex),
              overlay = wrapper.find('.hotspot-overlay');
            hotspotHighlight.hide();
            overlay.hide();
          }
        );
      }
    }
  }

})(jQuery);
