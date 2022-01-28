import React, { Component } from 'react';
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


class Seed extends Component {

    handleClick = (event) =>{
        event.preventDefault()
        this.props.onRemoveSeedInSeeds(this.props.seed)
    }

    render() {
        return (
            <React.Fragment>
                <tr>
                    <th scope="row">{this.props.seed.conceptId}</th>
                    <td>{this.props.seed.conceptId}</td>
                    <td>{this.props.seed.conceptName}</td>
                    <td><FontAwesomeIcon icon={faTrashAlt} onClick={this.handleClick} /></td>
                </tr>
            </React.Fragment>
        );
    }
}

export default Seed;