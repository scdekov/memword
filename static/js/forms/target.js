import ko from 'knockout'
import Arbiter from 'promissory-arbiter'
import {BaseForm} from './base'
import {Scout} from 'scout'
import {Target} from 'data/target'
import {fetchJSON} from 'utils'

export class EditTarget extends BaseForm {
    constructor (target = {}) {
        super()
        this.target = target
        this.q = target.identifier || ko.observable()
        this.queryCorrection = ko.observable()
        this.links = ko.observableArray()
        this.description = target.description || ko.observable()
        this.selectedLink = target.imgLink || ko.observable()
        this.allowCreate = ko.computed(() => this.q() && (this.selectedLink() || this.description()))
        this.hasNextLink = ko.computed(() => this.links().indexOf(this.selectedLink()) < this.links().length - 1)
        this.hasPrevLink = ko.computed(() => this.links().indexOf(this.selectedLink()))

        this.search = ko.pureComputed(() => {
            if (!this.q()) { return }
            this.loading(true)

            var loaders = [this.loadImages(this.q())]
            if (!this.target) {
                loaders.extend([
                    this.loadCorrectQuery(this.q()),
                    this.loadMeaning(this.q())
                ])
            }
            Promise.all(loaders).finally(this.loading.bind(this, false))
        }).extend({throttle: 1000})
    }

    loadImages (q) {
        return Scout.getImages(q)
            .then(images => {
                this.links(images)
                if (this.selectedLink() && images.indexOf(this.selectedLink()) === -1) {
                    this.links().push(this.selectedLink())
                }
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

    prevLink () {
        let ix = this.links().indexOf(this.selectedLink())
        this.selectedLink(this.links()[ix - 1])
    }

    nextLink () {
        let ix = this.links().indexOf(this.selectedLink())
        this.selectedLink(this.links()[ix + 1])
    }

    _save () {
        return fetchJSON('/api/targets/', {
            method: 'POST',
            body: JSON.stringify({
                img_link: this.selectedLink(),
                identifier: this.q(),
                description: this.description()
            })
        }).then(jsonData => {
            Arbiter.publish('new-target', new Target(jsonData))
            this.clear()
        })
    }
}
