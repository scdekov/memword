import ko from 'knockout'

ko.bindingHandlers.img = {
    update: (element, valueAccessor) => {
        var link = ko.unwrap(valueAccessor())
        if (!link) {
            if (element.src) {
                element.src = null
            }
            return
        }

        element.src = link
        let loadingSpinner = document.createElement('div')
        loadingSpinner.classList.add('loading-spinner')
        element.parentNode.insertBefore(loadingSpinner, element.nextSibling)

        element.addEventListener('load', () => {
            loadingSpinner.remove()
        })
    }
}

function elementInViewport (el) {
    var top = el.offsetTop
    var left = el.offsetLeft
    var width = el.offsetWidth
    var height = el.offsetHeight

    while (el.offsetParent) {
        el = el.offsetParent
        top += el.offsetTop
        left += el.offsetLeft
    }

    return (
        top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
    )
}

function addSrcIfVisible (element, src) {
    if (elementInViewport(element)) {
        element.src = src
    }
}

ko.bindingHandlers.inactiveImg = {
    init: (element, valueAccessor) => {
        var src = ko.unwrap(valueAccessor())
        if (!src) {
            return
        }

        addSrcIfVisible(element, src)
        setInterval(addSrcIfVisible.bind(this, element, src), 2000)
    }
}
