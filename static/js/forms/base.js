import ko from 'knockout'

export class BaseForm {
    constructor () {
        this.loading = ko.observable()
    }

    save () {
        this.loading(true)
        return this._save(arguments)
            .then(this.loading.bind(this, false))
    }

    clear () {
        for (let [, value] of Object.entries(this)) {
            if (ko.isObservable(value) && !ko.isComputed(value)) {
                if (!(value.destroyAll === undefined)) {
                    value([])
                } else {
                    value('')
                }
            }
        }
    }

    hasChanges () {
        return true
    }
}
