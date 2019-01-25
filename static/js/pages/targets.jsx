import React, { Component } from 'react'
import VisibilitySensor from 'react-visibility-sensor'
import classNames from 'classnames'
import { Target } from 'data/target'
import { debug } from 'util';

class TargetsComponent extends Component {
    renderFirst () {
        if (!this.props.activeTarget || this.props.activeTarget.id !== null) {
            return <BlankTargetComponent storeAPI={this.props.storeAPI} />
        } else {
            return <ActiveTargetComponent key='active'
                data={this.props.activeTarget}
                storeAPI={this.props.storeAPI} />
        }
    }

    renderTarget (target) {
        if (!this.props.activeTarget || this.props.activeTarget.id !== target.id) {
            return <TargetComponent
                key={target.id}
                data={target}
                storeAPI={this.props.storeAPI} />
        } else {
            return <ActiveTargetComponent key='active'
                data={this.props.activeTarget}
                storeAPI={this.props.storeAPI} />
        }
    }

    render () {
        return (
            <div className="page">
                <div className="cards-container">
                    {this.renderFirst()}
                    {this.props.targets.map((target) => this.renderTarget(target))}
                </div>
            </div>
        )
    }
}


class BlankTargetComponent extends Component {
    render () {
        return (
            <div className="card new-target-card edit-target"
                onClick={() => this.props.storeAPI.setNewAsActiveTarget()}>
                <div className="new-target-cover">
                    <a href="#" className="add-btn">
                        <span className="glyphicon glyphicon-plus circled-glyph"></span>
                    </a>
                </div>
                <input className="card-title" placeholder="Title" />
            </div>

        )
    }
}
class TargetComponent extends Component {
    componentWillMount () {
        this.setState({ shownLink: '' })
    }

    onImgVisibilityChange (isVisible) {
        if (isVisible && !this.state.shownLink) {
            this.setState({ shownLink: this.props.data.imgLink })
        }
    }

    render () {
        const imgClasses = classNames({
            'card-footer': true,
            'card-footer-hover-blur': true,
            'loadable': !this.state.shownLink,
        })

        return (
            <VisibilitySensor partialVisibility={true} onChange={this.onImgVisibilityChange.bind(this)}>
                <div className="card" key={this.props.data.id}>
                    <span className="card-title">{this.props.data.identifier}</span>
                    <span className="card-body">{this.props.data.description}</span>
                        <img className={imgClasses} src={this.state.shownLink} />
                    <div className="card-footer-hover">
                        <div className="footer-left">
                            <button className='btn-link' onClick={() => this.props.storeAPI.setActiveTarget(this.props.data.id)}>
                                <span className="glyphicon glyphicon-pencil circled-glyph" title="edit"></span>
                            </button>
                        </div>
                        <div className="footer-right">
                            <button className='btn-link' onClick={() => this.props.storeAPI.removeTarget(this.props.data.id)}>
                                <span className="glyphicon glyphicon-trash circled-glyph" title="delete"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </VisibilitySensor>
        )
    }
}

class ActiveTargetComponent extends Component {
    componentDidMount () {
        this.identifierInput.focus()
    }

    getNextLink () {
        return this.props.data.imgLinks[this._getActiveTargetImgLinkIx() + 1]
    }

    getPrevLink () {
        return this.props.data.imgLinks[this._getActiveTargetImgLinkIx() - 1]
    }

    setNextLink () {
        this.props.storeAPI.modifyActiveTarget({imgLink: this.getNextLink()})
    }

    setPrevLink () {
        this.props.storeAPI.modifyActiveTarget({imgLink: this.getPrevLink()})
    }

    _getActiveTargetImgLinkIx () {
        return this.props.data.imgLinks.indexOf(this.props.data.imgLink)
    }

    onIdentifierChanged (e) {
        this.props.storeAPI.modifyActiveTarget({ identifier: e.target.value })
    }

    onDescriptionChanged (e) {
        this.props.storeAPI.modifyActiveTarget({ description: e.target.value })
    }

    onOverlayClicked () {
        this.props.storeAPI.saveActiveTarget()
    }

    render () {
        let loading = this.props.data.identifier && !this.props.data.imgLink
        let cardFooterClasses = classNames({
            'card-footer': true,
            'card-footer-hover-blur': loading
        })
        return (
            <div className="card new-target-card edit-target card-activity">
                <input className="card-title" placeholder="Title" ref={input => { this.identifierInput = input }}
                       value={this.props.data.identifier} onChange={this.onIdentifierChanged.bind(this)} />
                {/* <div data-bind="visible: queryCorrection, popup: queryCorrection">
                    <span className="arrow"></span>
                    <p>Did you mean <a href="#" data-bind="click: correctQuery, text: queryCorrection"></a></p>
                </div> */}
                <textarea className="card-body" value={this.props.data.description}
                          onChange={this.onDescriptionChanged.bind(this)}></textarea>
                <img className="card-footer" src={this.props.data.imgLink} />
                <div className={cardFooterClasses}>
                    <div className="footer-left text-start">
                        {
                            !!this.getPrevLink() &&
                            <a href="#" onClick={this.setPrevLink.bind(this)}>
                                <span className="glyphicon glyphicon-chevron-left" title="previous"></span>
                            </a>
                        }
                    </div>
                    <div className="footer-right text-end">
                    {
                        !!this.getNextLink() &&
                        <a href="#" onClick={this.setNextLink.bind(this)}>
                            <span className="glyphicon glyphicon-chevron-right" title="next"></span>
                        </a>
                    }
                    </div>
                </div>
                {(() => {
                    if (loading) {
                        <div className="footer-body-loader">
                            <span className="loading-spinner"></span>
                        </div>
                    }
                })()}
                <div className="active card-activity-overlay" onClick={this.onOverlayClicked.bind(this)}></div>
            </div>
        )
    }
}

export default TargetsComponent
