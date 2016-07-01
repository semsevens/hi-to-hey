var ModalEffects = (function() {

  var overlay = document.querySelector('.md-overlay');
  var modal = document.querySelector('#modal-18');
  var el = document.querySelector('.md-trigger');

  function removeModal(hasPerspective) {
    classie.remove(modal, 'md-show');

    if (hasPerspective) {
      classie.remove(document.documentElement, 'md-perspective');
    }
  }

  function removeModalHandler() {
    removeModal(classie.has(el, 'md-setperspective'));
  }

  function showModal() {
    classie.add(modal, 'md-show');
    overlay.removeEventListener('click', removeModalHandler);

    if (classie.has(el, 'md-setperspective')) {
      setTimeout(function() {
        classie.add(document.documentElement, 'md-perspective');
      }, 25);
    }
  };

  function hideModal() {
    removeModalHandler();
  }

  function init() {


    showModal();
  }

  return {
    init: init,
    showModal: showModal,
    hideModal: hideModal
  };
})();

