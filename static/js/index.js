import '../css/style'

import ko from 'knockout'
import {TargetsPage} from 'pages/targets'
import {LessonsPage} from 'pages/lessons'

class IndexVM {
    constructor () {
        this.targetsPage = new TargetsPage()
        this.lessonsPage = new LessonsPage()

        this.activePage = ko.observable(this.targetsPage)
    }
}

ko.applyBindings(new IndexVM())
