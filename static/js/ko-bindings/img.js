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
