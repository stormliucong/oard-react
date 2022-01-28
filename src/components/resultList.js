import React, { Component } from 'react';
import Result from './result'

class ResultList extends Component {

    state = {addAll : false}

    handleClick = (event) =>{
        event.preventDefault()
        this.setState({addAll: this.state.addAll === false ? true : false})
        // this.props.onToggleAllInResultList(this.state)
    }

    formatToggleButton () {
        if (this.state.addAll === false) return (<label className="btn btn-outline-success my-2 my-sm-0" onClick={this.handleClick}>Add all to the seeds</label>)
        return (<label className="btn btn-outline-success my-2 my-sm-0" onClick={this.handleClick}>Remove all from the seeds</label>)
    }
    render() {
        if (this.props.resultList.length === 0) return (<p>Current result list is empty!</p>)

        return (
            <div>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Concept ID</th>
                            <th scope="col">Concept name</th>
                            <th scope="col">{this.formatToggleButton()}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.resultList.map(result => <Result key={result.conceptId} result={result} onToggleSeedInResults={this.props.onToggleSeedInResults}/>)}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ResultList;