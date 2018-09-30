import ko from 'knockout'

ko.bindingHandlers.img = {
    update: (element, valueAccessor) => {
        element.src = ko.unwrap(valueAccessor())
        let loadingSpinner = document.createElement('div')
        loadingSpinner.classList.add('loading-spinner')
        element.parentNode.insertBefore(loadingSpinner, element.nextSibling)

        element.addEventListener('load', () => {
            loadingSpinner.remove()
        })
    }
}
