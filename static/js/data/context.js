import ko from 'knockout'
import {Target} from 'data/target'
import {LessonRepresentation} from 'data/lesson'
import {fetchJSON} from 'utils'

export class Context {
    constructor () {
        this.targets = ko.observableArray()
        this.lessons = ko.observableArray()

        this._load()
    }

    _load () {
        this._loadLessons()
        this._loadTargets()
    }

    _loadTargets () {
        fetchJSON('/api/targets/')
            .then(jsonData => {
                this.targets(jsonData.map(targetData => {
                    return new Target(targetData)
                }))
            })
    }

    _loadLessons () {
        fetchJSON('/api/lessons/')
            .then(jsonData => {
                this.lessons(jsonData.map(lessonData => {
                    return new LessonRepresentation(lessonData)
                }))
            })
    }
}
