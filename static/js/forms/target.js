import ko from 'knockout'
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
        this.hasPrevLink = ko.computed(() => this.links().indexOf(this.selectedLink()) > 0)

        this.search = ko.pureComputed(() => {
            if (!this.q()) { return }
            this.loading(true)

            Promise.all([
                this.loadImages(this.q()),
                this.loadCorrectQuery(this.q()),
                this.loadMeaning(this.q())
            ]).finally(this.loading.bind(this, false))
        }).extend({throttle: 1000})
    }

    loadImages (q) {
        return Scout.getImages(q)
            .then(images => {
                let includeCurrent = this.links().length === 0 && this.selectedLink()
                this.links(images)
                if (includeCurrent && images.indexOf(this.selectedLink()) === -1) {
                    this.links().push(this.selectedLink())
                }

                if (!includeCurrent) {
                    this.selectedLink(this.links()[0])
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

    save () {
        if (this._isNewTarget()) {
            return this._save()
        }

        return this._update()
    }

    _isNewTarget () {
        return !this.target || Object.keys(this.target).length === 0
    }

    hasChanges () {
        if (!this._isNewTarget()) {
            // TODO
            return true
        }

        return this.q()
    }

    _update () {
        return fetchJSON(`/api/targets/${ko.unwrap(this.target.id)}/`, {
            method: 'PATCH',
            body: JSON.stringify({
                img_link: this.selectedLink(),
                identifier: this.q(),
                description: this.description()
            })
        })
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
            this._clear()
            return new Target(jsonData)
        })
    }

    _clear () {
        this.target = null
        this.q('')
        this.queryCorrection('')
        this.links([])
        this.description('')
        this.selectedLink('')
    }
}
