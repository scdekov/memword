import ko from 'knockout'
import Arbiter from 'promissory-arbiter'
import {BaseForm} from './base'
import {Scout} from 'scout'
import {Target} from 'data/target'

export class NewTargetForm extends BaseForm {
    constructor () {
        super()
        this.q = ko.observable()
        this.queryCorrection = ko.observable()
        this.links = ko.observableArray()
        this.description = ko.observable()
        this.selectedLink = ko.observable()
        this.allowCreate = ko.computed(() => this.q() && (this.selectedLink() || this.description()))

        this.search = ko.pureComputed(() => {
            if (!this.q()) { return }
            this.loading(true)
            Promise.all([
                this.loadCorrectQuery(this.q()),
                this.loadImages(this.q()),
                this.loadMeaning(this.q())
            ]).finally(this.loading.bind(this, false))
        }).extend({throttle: 1000})
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

    loadCorrectQuery (q) {
        return Scout.getCorrectQuery(q)
            .then(correct => {
                this.queryCorrection((correct && correct !== q) ? correct : '')
            })
    }

    correctQuery () {
        this.q(this.queryCorrection())
    }

    _save () {
        return fetch('/api/targets/', {
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
}
