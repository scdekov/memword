import ko from 'knockout'

export class Association {
    constructor (data) {
        this.id = data.id
        this.description = ko.observable(data.description)
        this.imgLink = ko.observable(data.img_link)
        this.author = ko.observable(data.author_id)
    }
}

export class Target {
    constructor (data) {
        this.id = data.id
        this.identifier = ko.observable(data.identifier)
        this.associations = ko.observableArray(
            data.associations.map(associationData => new Association(associationData)))
    }

    save () {

    }

    saveAssociation (association) {
        fetch(`/api/associations/${association.id}/`, {
            method: 'PATCH',
            body: JSON.stringify({
                description: ko.unwrap(association.description),
                img_link: ko.unwrap(association.imgLink)
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}
