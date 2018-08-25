import '../css/style'

import ko from 'knockout'
import Arbiter from 'promissory-arbiter'
import {Target} from 'data'

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
            .then(data => {
                data.json().then(jsonData => {
                    this.targets(jsonData.map(targetData => {
                        return new Target(targetData)
                    }))
                })
            })
    }

    activate (target) {
        this.active(target)
    }

    onNewTarget (target) {
        this.targets.push(target)
        this.activate(target)
    }

    remove (target) {
        fetch(`/api/targets/${target.id}/`, {
            method: 'DELETE'
        }).then(() => {
            this.targets.remove(target)
            this.active(this.newTarget)
        })
    }

    update (target) {
        fetch(`/api/targets/${target.id}/`, {
            method: 'PATCH',
            body: JSON.stringify({
                identifier: ko.unwrap(target.identifier)
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}

class NewTarget {
    constructor () {
        this.links = ko.observableArray()
        this.q = ko.observable()
        this.description = ko.observable()
        this.loading = ko.observable(false)
        this.selectedLink = ko.observable()
        this.allowCreate = ko.computed(() => this.q() && (this.selectedLink() || this.description()))
    }

    search () {
        this.loading(true)
        Promise.all([this.loadImages(this.q()), this.loadMeaning(this.q())])
            .then(this.loading.bind(this, false))
    }

    loadImages (q) {
        return fetch(`api/images?q=${encodeURIComponent(q)}`)
            .then(resp => {
                resp.json().then(json => {
                    this.links(json.images.slice(0, 10).map(item => {
                        return item.link
                    }))
                })
            })
    }

    loadMeaning (q) {
        return fetch(`api/meanings?q=${encodeURIComponent(q)}`)
            .then(resp => {
                resp.json().then(json => {
                    this.description(json.meanings[0].description)
                })
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
