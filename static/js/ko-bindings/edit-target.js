import ko from 'knockout'

ko.bindingHandlers.editTarget = {
    init: (element, _va, _ab, viewModel, bindingContext) => {
        element.addEventListener('click', () => {
            bindingContext.$parent.activateTarget(viewModel)
            document.body.addEventListener('click', e => {
                let overlay = document.body.querySelector('div.card-activity-overlay')
                if (e.target === overlay) {
                    bindingContext.$parent.saveActiveTarget()
                }
            })
            // document.body.querySelector('.edit-target .card-title').focus({preventScroll: true})
        })
    }
}
