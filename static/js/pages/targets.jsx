import React, { Component } from 'react'
import VisibilitySensor from 'react-visibility-sensor'
import classNames from 'classnames'
import {Target} from 'data/target'

class TargetsComponent extends Component {
    renderFirst () {
        if (!this.props.activeTarget || this.props.activeTarget.id !== null) {
            return <BlankTargetComponent/>
        } else {
            return <ActiveTargetComponent key='active'
                                          data={this.props.activeTarget}
                                          storeAPI={this.props.storeAPI}
                                          activeTargetImgLinks={this.props.activeTargetImgLinks}/>
        }
    }

    renderTarget (target) {
        if (!this.props.activeTarget || this.props.activeTarget.id !== target.id) {
            return <TargetComponent
                    key={target.id}
                    data={target}
                    storeAPI={this.props.storeAPI}/>
        } else {
            return <ActiveTargetComponent key='active'
                                          data={this.props.activeTarget}
                                          storeAPI={this.props.storeAPI}
                                          activeTargetImgLinks={this.props.activeTargetImgLinks}/>
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
                 onClick={() => this.props.storeAPI.setActiveTarget(new Target())}>
                <div className="new-target-cover">
                    <a href="#" className="add-btn">
                        <span className="glyphicon glyphicon-plus circled-glyph"></span>
                    </a>
                </div>
                <input className="card-title" placeholder="Title"/>
            </div>

        )
    }
}


class TargetComponent extends Component {
    componentWillMount () {
        this.setState({shownLink: ''})
    }

    onImgVisibilityChange (isVisible) {
        if (isVisible && !this.state.shownLink) {
            this.setState({shownLink: this.props.data.imgLink})
        }
    }

    render () {
        const imgClasses = classNames({
            'card-footer': true,
            'card-footer-hover-blur': true,
            'loadable': !this.state.shownLink,
        })

        return (
            <div className="card" key={this.props.data.id}>
                <span className="card-title">{this.props.data.identifier}</span>
                <span className="card-body">{this.props.data.description}</span>
                <VisibilitySensor onChange={this.onImgVisibilityChange.bind(this)}>
                    <img className={imgClasses} src={this.state.shownLink}/>
                </VisibilitySensor>
                <div className="card-footer-hover">
                    <div className="footer-left">
                        <button className='btn-link' onClick={() => this.props.storeAPI.setActiveTarget(this.props.data)}>
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
        )
    }
}

class ActiveTargetComponent extends Component {
    hasPrevLink () {
        return this.props.activeTargetImgLinks.indexOf(this.props.data.imgLink) > 0
    }

    hasNextLink () {
        return this.props.activeTargetImgLinks.indexOf(this.props.data.imgLink) <
               this.props.activeTargetImgLinks.length - 1
    }

    onIdentifierChanged () {
        this.props.storeAPI.loadActiveTargetImgLinks()
        this.props.storeAPI.loadActiveTargetMeaning()
    }

    render () {
        let loading = this.props.data.identifier && !this.props.data.imgLink
        let cardFooterClasses = classNames({
            'card-footer': true,
            'card-footer-hover-blur': loading
        })
        return (
            <div className="card new-target-card edit-target card-activity">
                <input className="card-title" placeholder="Title" value={this.props.data.identifier}/>
                {/* <div data-bind="visible: queryCorrection, popup: queryCorrection">
                    <span className="arrow"></span>
                    <p>Did you mean <a href="#" data-bind="click: correctQuery, text: queryCorrection"></a></p>
                </div> */}
                <textarea className="card-body" value={this.props.data.description}></textarea>
                <img className="card-footer" src={this.props.data.imgLink}/>
                <div className={cardFooterClasses}>
                    <div className="footer-left text-start">
                    {
                        (() => {
                            if (this.hasPrevLink()) {
                                <a href="#">
                                    <span className="glyphicon glyphicon-chevron-left" title="previous"></span>
                                </a>
                        }})()
                    }
                    </div>
                    {
                        (() => {
                            if (this.hasNextLink()) {
                                <a href="#">
                                    <span className="glyphicon glyphicon-chevron-right" title="next"></span>
                                </a>
                        }})()
                    }
                    <div className="footer-right text-end">
                    </div>
                </div>
                {(() => {
                    if (loading) {
                        <div className="footer-body-loader">
                            <span className="loading-spinner"></span>
                        </div>
                    }
                })()}
                <div className="active card-activity-overlay"></div>
            </div>
         )
    }
}

export default TargetsComponent
