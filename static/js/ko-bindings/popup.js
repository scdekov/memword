import ko from 'knockout'

ko.bindingHandlers.popup = {
    init: element => {
        element.classList.add('popup')
    },
    update: (element, valueAccessor) => {
        ko.unwrap(valueAccessor()) // we should resize on change of this
        // wait for inner elements to render and than fix the position
        setTimeout(() => {
            element.style.right = -9 - element.offsetWidth + 'px'
            console.log(element.style.right)
        }, 100)
    }
}
