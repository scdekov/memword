import '../css/style'
import 'ko-components/lesson'
import 'ko-bindings/edit-target'
import 'ko-bindings/img'
import 'ko-bindings/popup'

import { LessonsPage } from 'pages/lessons'
import { Target } from 'data/target'
import { Scout } from 'scout'
import { fetchJSON, debounce } from 'utils'

import React from 'react';
import ReactDOM from 'react-dom';
import TargetsComponent from 'pages/targets.jsx';

class StoreAPI {
    constructor(onChange) {
        this.onChange = onChange
        this._data = {
            targets: [],
            activeTarget: null,
        }

        // imgLinks: reload
        // activeTarget: {
        //     id: 2,
        //     imgLinks: [],
        //     imgLink: 'ads',
        // }


        this._loadTargets()
        this.loadActiveTargetDescription = debounce(this._loadActiveTargetDescription.bind(this), 1000)
        this.loadActiveTargetImgLinks = debounce(this._loadActiveTargetImgLinks.bind(this), 1000)
    }

    data () {
        return this._data
    }

    _loadTargets () {
        fetchJSON('/api/targets/')
            .then(jsonData => {
                const targets = jsonData.map(targetData => {
                    return new Target(targetData)
                })
                this._setData({ targets })
            })
    }

    _loadActiveTargetImgLinks () {
        return Scout.getImages(this._data.activeTarget.identifier)
            .then(links => {
                if (!this._data.activeTarget) return

                let { activeTarget } = this._data
                if (!activeTarget.imgLink || links.indexOf(activeTarget.imgLink) === -1) {
                    activeTarget = Object.assign(activeTarget, { imgLink: links[0], imgLinks: links })
                } else {
                    activeTarget = Object.assign(activeTarget, { imgLinks: links })
                }

                this._setData({ activeTarget })
            })
    }

    _loadActiveTargetDescription () {
        return Scout.getMeaning(this._data.activeTarget.identifier)
            .then(meaning => {
                if (!this._data.activeTarget) return

                if (!this._data.activeTarget.description) {
                    this._setData({activeTarget: Object.assign(this._data.activeTarget, {description: meaning})})
                } else {
                    // propose changing to default?
                }
            })
    }

    loadCorrectQuery (q) {
        return Scout.getCorrectQuery(q)
            .then(correct => {
                this.queryCorrection((correct && correct !== q) ? correct : '')
            })
    }

    saveActiveTarget () {
        let { id, identifier, description, imgLink } = this._data.activeTarget
        if (!identifier) {
            this._setData({ activeTarget: null })
            return
        }

        if (id) {
            fetchJSON(`/api/targets/${id}/`, {
                method: 'PATCH',
                body: JSON.stringify({
                    identifier: identifier,
                    description: description,
                    img_link: imgLink
                })
            }).then(jsonData => {
                let targets = this._data.targets.map(target => target.id === id ? new Target(jsonData) : target)
                this._setData({ targets, activeTarget: null })
            })
        } else {
            fetchJSON('/api/targets/', {
                method: 'POST',
                body: JSON.stringify({
                    identifier: identifier,
                    description: description,
                    img_link: imgLink
                })
            }).then(jsonData => { this._setData({ targets: [new Target(jsonData), ...this._data.targets],
                                                  activeTarget: null }) })
        }
    }

    removeTarget (id) {
        return fetchJSON(`/api/targets/${id}/`, {
            method: 'DELETE'
        })
            .then(() => {
                let targets = this._data.targets.filter(target => target.id !== id)
                this._setData({ targets })
            })
    }

    setNewAsActiveTarget () {
        this._setData({activeTarget: {
            id: null,
            imgLink: null,
            identifier: '',
            description: '',
            imgLinks: []
        }})
    }

    setActiveTarget (id) {
        let target = this._data.targets.find(target => target.id === id)
        this._setData({activeTarget: {
            id,
            imgLink: target.imgLink,
            identifier: target.identifier,
            description: target.description,
            imgLinks: []
        }})
        this.loadActiveTargetImgLinks()
    }

    modifyActiveTarget (changes) {
        if (changes.identifier) {
            this.loadActiveTargetImgLinks()
            this.loadActiveTargetDescription()
        }

        this._setData({ activeTarget: Object.assign(this._data.activeTarget, changes) })
    }

    _setData (newData) {
        this._data = Object.assign(this._data, newData)
        this.onChange()
    }
}

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = { storeAPI: new StoreAPI(this.forceUpdate.bind(this)) }
    }

    render () {
        return (
            <TargetsComponent storeAPI={this.state.storeAPI}
                targets={this.state.storeAPI.data().targets}
                activeTarget={this.state.storeAPI.data().activeTarget}
            />
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
