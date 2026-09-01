// Mock-site behavior: nav toggle, scroll reveals, and demo-only form handling.
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var items = document.querySelectorAll('.reveal');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduced) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    // Only hide content once we know the observer will reveal it again.
    document.documentElement.classList.add('js-reveal');
    // Safety net: anything already on screen after a moment is shown regardless.
    setTimeout(function () {
      items.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('in'); }
      });
    }, 2000);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  var form = document.querySelector('[data-demo-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var fields = form.querySelector('[data-demo-fields]');
      var success = form.querySelector('[data-demo-success]');
      if (fields && success) {
        fields.hidden = true;
        success.hidden = false;
        success.focus();
      }
    });
  }
})();
