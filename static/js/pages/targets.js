import ko from 'knockout'
import Arbiter from 'promissory-arbiter'
import {Target} from 'data/target'
import {NewTargetForm} from 'forms/target'
import {Scout} from 'scout'

export class TargetsPage {
    constructor () {
        this.templateName = 'targets-page'
        this.newTargetForm = new NewTargetForm()

        this.targets = ko.observableArray()
        this.active = ko.observable(this.newTargetForm)

        this.load()

        Arbiter.subscribe('new-target', this.onNewTarget.bind(this))
    }

    load () {
        fetch('/api/targets/')
            .then(data => data.json())
            .then(jsonData => {
                this.targets(jsonData.map(targetData => {
                    return new Target(targetData)
                }))
            })
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
