import ko from 'knockout'
import Arbiter from 'promissory-arbiter'
import {EditTarget} from 'forms/target'

export class TargetsPage {
    constructor (context) {
        this.templateName = 'targets-page'

        this.targets = context.targets
        this.active = ko.observable()
        this.newTarget = new EditTarget()
        this.editingNewTarget = ko.observable()

        Arbiter.subscribe('new-target', this.onNewTarget.bind(this))
    }

    activateTarget (target) {
        this.active(new EditTarget(target))
    }

    editNewTarget () {
        this.editingNewTarget(true)
    }

    stopEditNewTarget () {
        this.newTarget.save()
            .then(target => {
                this.targets.unshift(target)
                this.editingNewTarget(false)
            })
    }

    saveActiveTarget () {
        this.active().save()
            .then(() => this.active(null))
    }

    onNewTarget (target) {
        this.targets.push(target)
        this.activateTarget(target)
    }

    removeTarget (target) {
        target.delete().then(() => {
            this.targets.remove(target)
        })
    }

    saveTarget (target) {
        target.save()
    }
}
