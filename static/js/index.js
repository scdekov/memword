import '../css/style'

import ko from 'knockout'
import Arbiter from 'promissory-arbiter'
import {Target} from 'data'
import {Scout} from 'scout'

class PageVM {
    constructor () {
        this.newTarget = new NewTarget()
        this.targets = ko.observableArray()
        this.active = ko.observable(this.newTarget)

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
            this.active(this.newTarget)
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

class NewTarget {
    constructor () {
        this.loading = ko.observable(false)

        this.q = ko.observable()
        this.links = ko.observableArray()
        this.description = ko.observable()
        this.selectedLink = ko.observable()
        this.allowCreate = ko.computed(() => this.q() && (this.selectedLink() || this.description()))
    }

    search () {
        this.loading(true)
        Promise.all([this.loadImages(this.q()), this.loadMeaning(this.q())])
            .then(this.loading.bind(this, false))
    }

    loadImages (q) {
        return Scout.getImages(q)
            .then(images => {
                this.links(images)
            })
    }

    loadMeaning (q) {
        return Scout.getMeaning(q)
            .then(meaning => {
                this.description(meaning)
            })
    }

    add () {
        fetch('/api/targets/', {
            method: 'POST',
            body: JSON.stringify({
                img_link: this.selectedLink(),
                identifier: this.q(),
                description: this.description()
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((resp) => {
            resp.json().then(jsonData => {
                Arbiter.publish('new-target', new Target(jsonData))
                this.clear()
            })
        })
    }

    clear () {
        this.q('')
        this.selectedLink('')
        this.links([])
    }
}

ko.applyBindings(new PageVM())
