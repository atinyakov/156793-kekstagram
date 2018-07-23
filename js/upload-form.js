'use strict';

(function () {
  var SCALE_LINE_LENGTH = 450;
  var PERCENTS_100 = 100;
  var LEFT_MOUSE_BUTTON = 0;
  var SERVER_URL = 'https://js.dump.academy/kekstagram';
  var MAX_SCALE = 100; // %
  var MIN_SCALE = 25; // %
  var MAX_SYMBOLS = 140;
  var HASHTAGS_MAX = 5;
  var HASHTAG_LENGTH = 20;

  var uploadForm = document.querySelector('.img-upload__form');
  var imgPreview = uploadForm.querySelector('.img-upload__preview');
  var uploadFile = uploadForm.querySelector('#upload-file');
  var uploadOverlay = uploadForm.querySelector('.img-upload__overlay');
  var closeOverlayButton = uploadForm.querySelector('.img-upload__cancel');
  var filterPin = uploadForm.querySelector('.scale__pin ');
  var FILTER_INITIAL_X = 20;
  var filterScalePlaceholder = uploadForm.querySelector('.img-upload__scale');
  var filterScale = uploadForm.querySelector('.scale__level');
  var filters = uploadForm.querySelector('.effects__list');
  var textDescription = uploadForm.querySelector('.text__description');

  var scaleMinus = uploadForm.querySelector('.resize__control--minus');
  var scalePlus = uploadForm.querySelector('.resize__control--plus');
  var scaleValue = uploadForm.querySelector('.resize__control--value');

  var currentScale;
  var step = 25;


  var closeUpload = function (evt) {

    if ((evt = window.backend.OK_RESPONCE) || (evt.target !== textDescription) && (evt.keyCode === window.popup.ESC_KEYCODE || (evt.target === closeOverlayButton && evt.buttons === LEFT_MOUSE_BUTTON) || (evt.target === closeOverlayButton && evt.keycode === window.popup.ENTER_KEYCODE))) {
      uploadFile.value = '';
      imgPreview.classList = 'img-upload__preview';
      imgPreview.style = '';
      scaleMinus.removeEventListener('mouseup', onScaleChange);
      scalePlus.removeEventListener('mouseup', onScaleChange);
      // window.popup.closePopup();

      uploadOverlay.classList.add('hidden');
      closeOverlayButton.removeEventListener('mouseup', closeUpload);
      closeOverlayButton.removeEventListener('keyup', closeUpload);
      window.removeEventListener('keyup', closeUpload);

      scaleMinus.removeEventListener('mouseup', onScaleChange);// добавить??
      scalePlus.removeEventListener('mouseup', onScaleChange); // добавить??
    }
  };


  var hashtagInput = uploadForm.querySelector('.text__hashtags');

  uploadFile.addEventListener('change', function () {
    uploadOverlay.classList.remove('hidden');
    scaleMinus.addEventListener('mouseup', onScaleChange);
    scalePlus.addEventListener('mouseup', onScaleChange);

    closeOverlayButton.addEventListener('mouseup', closeUpload);
    closeOverlayButton.addEventListener('keyup', closeUpload);

    window.addEventListener('keyup', closeUpload);

    filterPin.style.left = FILTER_INITIAL_X + '%';
    filterScale.style.width = FILTER_INITIAL_X + '%';
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
    imgPreview.className = 'img-upload__preview';
    imgPreview.style.filter = '';
    var currentEffect = evt.target.classList[1];
    imgPreview.classList.add(currentEffect);
    defineFilterRatio(filterScale.style.width.slice(0, -1));
  });


  // --------------HASHTAGS---------------------------

  var onHashtagSubmit = function (evt) {
    var hashtags;

    hashtags = hashtagInput.value.split(' ');
    evt.target.setCustomValidity('');
    evt.target.classList.remove('error__input');

    for (var i = 0; i < hashtags.length; i++) {
      var elem = hashtags[i];
      if (hashtags[i] === '') {
        evt.target.setCustomValidity('между хештегами должен быть один пробел!');
        evt.target.classList.add('error__input');
        return;
      } else if (hashtags[i].charAt(0) !== '#') {
        evt.target.setCustomValidity('Хеш тег должен начинаться с символа решетка: #');
        evt.target.classList.add('error__input');
        return;
      } else if (hashtags[i] === '#') {
        evt.target.setCustomValidity('Хештег не может состоять из одной #!');
        evt.target.classList.add('error__input');
        return;
      } else if (hashtags[i].length > HASHTAG_LENGTH) {
        evt.target.setCustomValidity('Хештег не может быть длиннее 20 символов!');
        evt.target.classList.add('error__input');
        return;
      }

      for (var j = 1; j < hashtags[i].length; j++) {
        if (hashtags[i].charAt(j) === '#') {
          evt.target.setCustomValidity('Хеш тег не может внутри себя содержать символ решетка: #');
          evt.target.classList.add('error__input');
        }
      }

      for (var k = i + 1; k < hashtags.length; k++) {
        if (elem === hashtags[k]) {
          evt.target.setCustomValidity('нельзя использовать одинаковые хештеги!');
          evt.target.classList.add('error__input');
        }
      }
    }
    if (hashtags.length > HASHTAGS_MAX) {
      evt.target.setCustomValidity('Максимум 5 хештегов');
      evt.target.classList.add('error__input');
    }
  };

  hashtagInput.addEventListener('change', onHashtagSubmit);
  // -------------------------text description --------------------------

  textDescription.addEventListener('change', function (evt) {
    evt.target.setCustomValidity('');
    evt.target.style.border = '2px solid transparent';
    if ((evt.target.value !== '') && (evt.target.value.length > MAX_SYMBOLS)) {
      evt.target.setCustomValidity('Максимум 140 символов');
      evt.target.style.border = '2px solid red';
      return;
    }
  });
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

  var onSuccess = function (serverResponce) {
    textDescription.value = '';
    hashtagInput.value = '';
    uploadFile.value = '';
    // window.popup.closePopup();
    closeUpload(serverResponce);
  };

  uploadForm.addEventListener('submit', function (evt) {
    evt.preventDefault();

    var formData = new FormData(uploadForm);

    window.send(formData, SERVER_URL, onSuccess, window.photos.onError);
  });

  // --------------------SCALE ---------------------------

  var onScaleChange = function (evt) {
    currentScale = scaleValue.value.slice(0, -1);
    if (evt.target.classList.contains('resize__control--minus')) {
      currentScale = currentScale - step;
    }
    if (evt.target.classList.contains('resize__control--plus')) {
      currentScale = +currentScale + step;
    }
    if ((MIN_SCALE <= currentScale) && (currentScale <= MAX_SCALE)) {
      scaleValue.value = currentScale + '%';
      imgPreview.style.transform = 'scale(' + currentScale / 100 + ')';
    }
  };

}());
