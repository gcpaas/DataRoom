var supportIE = {
  install: function (Vue) {
    Vue.directive('support', {
      inserted: function (el) {
        if (('placeholder' in document.createElement('input'))) {
          return
        }
        el = el.querySelector('[placeholder]')
        var placeholder = el.getAttribute('placeholder') || '请输入'
        var disabled = el.getAttribute('disabled')
        var span = document.createElement('span')
        span.className = 'ie-placeholder'
        span.innerText = placeholder
        span.style.left = el.offsetLeft + 'px'
        el.parentNode.style.position = 'relative'
        el.insertAdjacentElement('beforebegin', span)
        if (disabled === 'disabled') {
          span.style.display = 'none'
          return
        }
        el.onfocus = function (event) {
          setTimeout(function () {
            if (!event.target.value) {
              span.style.display = 'inline'
            } else {
              span.style.display = 'none'
            }
          }, 20)
        }
        el.onchange = function (event) {
          setTimeout(function () {
            if (!event.target.value) {
              span.style.display = 'inline'
            } else {
              span.style.display = 'none'
            }
          }, 20)
        }
        el.onblur = function (event) {
          setTimeout(function () {
            if (!event.target.value) {
              span.style.display = 'inline'
            } else {
              span.style.display = 'none'
            }
          }, 20)
        }
        el.oninput = function (event) {
          setTimeout(function () {
            if (!event.target.value) {
              span.style.display = 'inline'
            } else {
              span.style.display = 'none'
            }
          }, 20)
        }
        setTimeout(function () {
          // el.focus()
          el.blur()
        }, 10)
        span.onclick = function () {
          el.focus()
        }
      },
      unbind: function (el) {
        el.onfocus = el.onblur = el.oninput = null
      }
    })
  }
}

export default supportIE
