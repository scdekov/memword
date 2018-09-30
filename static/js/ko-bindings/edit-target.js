import ko from 'knockout'

ko.bindingHandlers.editTarget = {
    init: (element, _va, _ab, viewModel, bindingContext) => {
        element.addEventListener('click', () => {
            console.log('editing')
            bindingContext.$parent.activateTarget(viewModel)
            // document.body.querySelector('.edit-target .card-title').focus({preventScroll: true})
        })
    }
}
