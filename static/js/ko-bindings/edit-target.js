import ko from 'knockout'

ko.bindingHandlers.editTarget = {
    init: (element, _va, _ab, viewModel, bindingContext) => {
        var cardActive = false

        var bindSaving = e => {
            let overlay = document.querySelector('div.card-activity-overlay.active')
            if (e.target === overlay) {
                bindingContext.$parent.saveActiveTarget()
                e.target.removeEventListener(e.type, bindSaving)
            }
        }

        var bindActivate = e => {
            if (cardActive) {
                return
            }
            cardActive = true

            bindingContext.$parent.activateTarget(viewModel)
            document.body.addEventListener('click', bindSaving)
            e.target.removeEventListener(e.type, bindActivate)
        }

        element.addEventListener('click', bindActivate)
    }
}

ko.bindingHandlers.activateNewTarget = {
    init: (element, _va, _ab, viewModel, bindingContext) => {
        var cardActive = false

        var bindSaving = e => {
            let overlay = document.querySelector('div.card-activity-overlay.active')
            if (e.target === overlay) {
                bindingContext.$data.stopEditNewTarget()
                e.target.removeEventListener(e.type, bindSaving)
            }
        }

        var bindActivate = e => {
            if (cardActive) {
                return
            }
            cardActive = true

            bindingContext.$data.editNewTarget()
            document.body.addEventListener('click', bindSaving)
            e.target.removeEventListener(e.type, bindActivate)
        }

        element.addEventListener('click', bindActivate)
    }

}
