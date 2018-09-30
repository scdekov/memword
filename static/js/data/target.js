import ko from 'knockout'
import {fetchJSON} from 'utils'

export class Target {
    constructor (data) {
        this.id = data.id
        this.identifier = ko.observable(data.identifier)
        this.description = ko.observable(data.description)
        this.imgLink = ko.observable(data.img_link)
        this.author = ko.observable(data.author_id)
    }

    save () {
        return fetchJSON(`/api/targets/${this.id}/`, {
            method: 'PATCH',
            body: JSON.stringify({
                identifier: ko.unwrap(this.identifier),
                description: ko.unwrap(this.description),
                img_link: ko.unwrap(this.imgLink)
            })
        })
    }

    delete () {
        return fetchJSON(`/api/targets/${this.id}/`, {
            method: 'DELETE'
        })
    }
}
