import ko from 'knockout'
import Arbiter from 'promissory-arbiter'
import {NewTargetForm} from 'forms/target'
import {Scout} from 'scout'

export class TargetsPage {
    constructor (context) {
        this.templateName = 'targets-page'
        this.newTargetForm = new NewTargetForm()

        this.targets = context.targets
        this.active = ko.observable()

        Arbiter.subscribe('new-target', this.onNewTarget.bind(this))
    }

    activateTarget (target) {
        this.active(target)
    }

    onNewTarget (target) {
        this.targets.push(target)
        this.activateTarget(target)
    }

    removeTarget (target) {
        target.delete().then(() => {
            this.targets.remove(target)
            this.active(this.newTargetForm)
        })
    }

    saveTarget (target) {
        target.save()
    }

    setTargetDefaultDescription (target) {
        Scout.getMeaning(target.identifier())
            .then(meaning => {
                target.description(meaning)
            })
    }
}
