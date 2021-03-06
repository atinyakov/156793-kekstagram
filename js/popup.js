'use strict';

(function () {
  var COMMENTS_AMOUNT = 5;
  var bigPicture = document.querySelector('.big-picture');
  var pictures = document.querySelector('.pictures.container');
  var closeBigPicture = bigPicture.querySelector('.big-picture__cancel');
  var loadmoreButton = document.querySelector('.social__loadmore');
  var commentsBlock = document.querySelector('.social__comments');


  var hideElement = function (elem) {
    document.querySelector(elem).classList.add('visually-hidden');
  };

  var showElement = function (elem) {
    document.querySelector(elem).classList.remove('visually-hidden');
  };


  var closePopup = function () {

    bigPicture.classList.add('hidden');
    bigPicture.value = '';
    closeBigPicture.removeEventListener('mouseup', closePopup);

    document.removeEventListener('keyup', onKeyPress);
  };

  var onKeyPress = function (evt) {

    if (evt.keyCode === window.constants.ESC_KEYCODE) {
      closePopup();
      return;
    }

    if ((evt.keyCode === window.constants.ENTER_KEYCODE) && (evt.target === closeBigPicture)) {
      closePopup();
    }
  };

  var openBigPicture = function (i) {
    bigPicture.classList.remove('hidden');
    closeBigPicture.addEventListener('mouseup', closePopup);
    i--;
    bigPicture.querySelector('.big-picture__img img').src = window.photos.data[i].url;
    bigPicture.querySelector('.big-picture__img img').alt = '';
    bigPicture.querySelector('.likes-count').textContent = window.photos.data[i].likes;
    bigPicture.querySelector('.social__caption').textContent = window.photos.data[i].description;

    document.addEventListener('keyup', onKeyPress);
  };


  var addComments = function (j) {
    var commentsFragment = document.createDocumentFragment();
    var commentsToAdd;

    j--;

    var drowComments = function () {

      for (var i = 0; i < commentsToAdd; i++) {
        var commentTemplate = commentsBlock.querySelector('.social__comment').cloneNode(true);
        commentTemplate.querySelector('.social__picture').src = 'img/avatar-' + window.utils.generateRandomNumber(1, 6) + '.svg';
        commentTemplate.querySelector('.social__text').textContent = window.photos.data[j].comments[i];
        commentsFragment.appendChild(commentTemplate);
      }

      var comments = document.querySelectorAll('.social__comment');

      [].forEach.call(comments, function (el) {
        commentsBlock.removeChild(el);
      });

      commentsBlock.appendChild(commentsFragment);
    };

    var onloadMore = function () {
      commentsToAdd += 5;

      if (commentsToAdd >= window.photos.data[j].comments.length) {
        commentsToAdd = window.photos.data[j].comments.length;
        hideElement('.social__loadmore');
        loadmoreButton.removeEventListener('mouseup', onloadMore);
      }

      document.querySelector('.social__comment-count').textContent = commentsToAdd + ' из ' + window.photos.data[j].comments.length + ' комментариев';
      drowComments();
    };

    if (window.photos.data[j].comments.length < COMMENTS_AMOUNT) {
      commentsToAdd = window.photos.data[j].comments.length;
      hideElement('.social__loadmore');
      drowComments();
    } else {
      commentsToAdd = 5;
      showElement('.social__loadmore');
      drowComments();
    }

    loadmoreButton.addEventListener('mouseup', onloadMore);

    document.querySelector('.social__comment-count').textContent = commentsToAdd + ' из ' + window.photos.data[j].comments.length + ' комментариев';
  };


  var openPicture = function (evt) {

    if (evt.target.tagName === 'IMG' && evt.target.classList.value === 'picture__img') {
      var FROM = -6;
      var TO = -2;
      var photoURL = evt.target.src.slice(FROM, TO);
      var regexp = /\d+/;
      var photoNumbersInUrl = photoURL.match(regexp);
      openBigPicture(photoNumbersInUrl[0]);
      addComments(photoNumbersInUrl[0]);
    }
  };

  pictures.addEventListener('mouseup', openPicture);
})();
