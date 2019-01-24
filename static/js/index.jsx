import '../css/style'
import 'ko-components/lesson'
import 'ko-bindings/edit-target'
import 'ko-bindings/img'
import 'ko-bindings/popup'

import {LessonsPage} from 'pages/lessons'
import {Context} from 'data/context'
import {Target} from 'data/target'
import {fetchJSON} from 'utils'

import React from 'react';
import ReactDOM from 'react-dom';
import TargetsComponent from 'pages/targets.jsx';

class StoreAPI {
    constructor (onChange) {
        this.onChange = onChange
        this._data = {
            targets: [],
            activeTarget: null,
            activeTargetImgLinks: []
        }

        this._loadTargets()
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
                this._setData({targets})

                this.onChange()
            })
    }

    loadActiveTargetImgLinks () {
        return Scout.getImages(this._data.activeTarget.identifier)
            .then(links => {
                let includeCurrent = this._data.activeTarget.imgLink // this._data.activeTargetImgLinks.length === 0 &&
                if (includeCurrent && links.indexOf(this._data.activeTarget.imgLink) === -1) {
                    links.push(this._data.activeTarget.imgLink)
                }

                let activeTarget = this._data.activeTarget
                if (!includeCurrent) {
                    let activeTarget = Object.assign(activeTarget, {imgLink: links[0]})
                }

                this._setData({activeTargetImgLinks: links, activeTarget: activeTarget})
            })
    }

    loadActiveTargetMeaning () {

    }

    loadMeaning (q) {
        return Scout.getMeaning(q)
            .then(meaning => {
                if (!this.description()) {
                    this.description(meaning)
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

    saveTarget () {
        return fetchJSON(`/api/targets/${this.id}/`, {
            method: 'PATCH',
            body: JSON.stringify({
                identifier: ko.unwrap(this.identifier),
                description: ko.unwrap(this.description),
                img_link: ko.unwrap(this.imgLink)
            })
        })
    }

    removeTarget (id) {
        return fetchJSON(`/api/targets/${id}/`, {
            method: 'DELETE'
        })
            .done(() => {
                let targets = this._data.targets.filter(target => target.id !== id)
                this._setData({targets})
            })
    }

    setActiveTarget (target) {
        this._setData({activeTarget: target})
    }

    _setData (newData) {
        this._data = Object.assign(this._data, newData)
        this.onChange()
    }
}

class App extends React.Component {
    constructor (props) {
        super(props)
        this.state = {storeAPI: new StoreAPI(this.forceUpdate.bind(this))}
    }

    render () {
        return (
            <TargetsComponent storeAPI={this.state.storeAPI}
                              targets={this.state.storeAPI.data().targets}
                              activeTarget={this.state.storeAPI.data().activeTarget}
                              activeTargetImgLinks={this.state.storeAPI.data().activeTargetImgLinks}
                              />
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));