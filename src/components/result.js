import React, { Component } from 'react';

class Result extends Component {
    handleClick = (event) =>{
        event.preventDefault()
        this.props.onToggleSeedInResults(this.props.result)
    }

    formatToggleButton () {
        if (this.props.result.inSeed === true) return (<label className="btn btn-outline-success my-2 my-sm-0" onClick={this.handleClick}>Remove from Seeds</label>)
        return (<label className="btn btn-outline-success my-2 my-sm-0" onClick={this.handleClick}>Add to Seeds</label>)
    }
    render() {
        return (
            <React.Fragment>
                <tr>
                    <th scope="row">{this.props.result.conceptId}</th>
                    <td>{this.props.result.conceptId}</td>
                    <td>{this.props.result.conceptName}</td>
                    <td>{this.formatToggleButton()}</td>
                </tr>
            </React.Fragment>
        );
    }
}

export default Result;