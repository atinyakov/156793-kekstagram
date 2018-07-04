'use strict';

(function () {
  var SPACE_KEYCODE = 32;
  var SCALE_LINE_LENGTH = 450;
  var PERCENTS_100 = 100;

  var uploadForm = document.querySelector('.img-upload__form');
  var imgPreview = uploadForm.querySelector('.img-upload__preview');
  var uploadFile = uploadForm.querySelector('#upload-file');
  var uploadOverlay = uploadForm.querySelector('.img-upload__overlay');
  var closeOverlayButton = uploadForm.querySelector('.img-upload__cancel');
  var filterPin = uploadForm.querySelector('.scale__pin ');
  var filterInitialX;
  var filterScalePlaceholder = uploadForm.querySelector('.img-upload__scale');
  var filterScale = uploadForm.querySelector('.scale__level');
  var filters = uploadForm.querySelector('.effects__list');
  var imagePreview = uploadForm.querySelector('.img-upload__preview');
  var submitButton = uploadForm.querySelector('#upload-submit');

  uploadFile.addEventListener('change', function () {
    uploadOverlay.classList.remove('hidden');
    closeOverlayButton.addEventListener('mouseup', window.pictures.closePopup);
    filterInitialX = 20;
    filterPin.style.left = filterInitialX + '%';
    filterScale.style.width = filterInitialX + '%';
  });

  var defineFilterRatio = function (ratio) {
    filterScalePlaceholder.style.display = 'block';
    if (imgPreview.classList.contains('effects__preview--chrome')) {
      imgPreview.style.filter = 'grayscale(' + ratio / PERCENTS_100 + ')';
    } else if (imgPreview.classList.contains('effects__preview--sepia')) {
      imgPreview.style.filter = 'sepia(' + ratio / PERCENTS_100 + ')';
    } else if (imgPreview.classList.contains('effects__preview--marvin')) {
      imgPreview.style.filter = 'invert(' + ratio + '%)';
    } else if (imgPreview.classList.contains('effects__preview--phobos')) {
      imgPreview.style.filter = 'blur(' + (ratio * 3 / PERCENTS_100) + 'px)';
    } else if (imgPreview.classList.contains('effects__preview--heat')) {
      imgPreview.style.filter = 'brightness(' + (1 + ratio * 2 / PERCENTS_100) + ')';
    } else if (imgPreview.classList.contains('effects__preview--none')) {
      filterScalePlaceholder.style.display = 'none';
    }
  };


  filters.addEventListener('mouseup', function (evt) {
    imagePreview.className = 'img-upload__preview';
    imgPreview.style.filter = '';
    var currentEffect = evt.target.classList[1];
    imagePreview.classList.add(currentEffect);
    defineFilterRatio(filterScale.style.width.slice(0, -1));
  });


  // --------------HASHTAGS---------------------------
  var hashtagInput = uploadForm.querySelector('.text__hashtags');

  var hashtagCheckHandler = function () {
    var hashtags;
    // var regexp = /#\w+\s/gi;

    hashtags = hashtagInput.value.split(' ', 5);

    hashtags.forEach(function (i) {
      if (i.match(/#\w+/) === null) {
        hashtagInput.setCustomValidity('hashtags should start with \'#\' and splitted by \' \'');
        // console.log('valid' + i);
      } else {
        console.log('valid ' + i);
      }
    });
    // }
  };

  hashtagInput.addEventListener('keyup', hashtagCheckHandler);

  // ---------------------------- filter drag -------------------------------

  filterPin.addEventListener('mousedown', function (evt) {
    evt.preventDefault();

    var startCoords = {};

    var mouseMoveHandler = function (moveEvt) {
      moveEvt.preventDefault();

      var scaleLineCoord = document.querySelector('.scale__line').getBoundingClientRect();

      startCoords = {
        x: Math.floor((moveEvt.clientX - scaleLineCoord.x) * PERCENTS_100 / SCALE_LINE_LENGTH)
      };


      filterPin.style.left = window.utils.mathClamp(0, startCoords.x, 100) + '%';
      filterScale.style.width = window.utils.mathClamp(0, startCoords.x, 100) + '%';
      defineFilterRatio(window.utils.mathClamp(0, startCoords.x, 100));
    };

    var mouseUpHandler = function (upEvt) {
      upEvt.preventDefault();

      defineFilterRatio(startCoords.x);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  });

  // ---------------FORM_SUBMIT----------------------

  var onError = function (message) {
    var errorMessage = document.querySelector('img-upload__message--error');
    errorMessage.classlist.remove('hidden');
  };

  var onSuccess = function () {
    alert('Загружено');
    window.pictures.closePopup();
  };

  uploadForm.addEventListener('submit', function (evt) {
    evt.preventDefault();
    // evt.checkValidity();

    var SERVER_URL = 'https://js.dump.academy/kekstagram';

    var formData = new FormData(uploadForm);
    window.send(formData, SERVER_URL, onSuccess, onError);
  });
}());