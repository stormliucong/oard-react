import React, { Component } from 'react';
import {Dropdown, Container} from 'react-bootstrap'

class Recommend extends Component {

    render() {
        return (

                <Dropdown className='mb-5'>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        Generate Recommendation by
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1" onClick={()=>this.props.onRecommend('line')} >LINE</Dropdown.Item>
                        <Dropdown.Item href="#/action-2" onClick={()=>this.props.onRecommend('node2vec')}>node2vec</Dropdown.Item>
                        <Dropdown.Item href="#/action-3" onClick={()=>this.props.onRecommend('svd')} >SVD</Dropdown.Item>
                        <Dropdown.Item href="#/action-4" onClick={()=>this.props.onRecommend('glove')} >GloVe</Dropdown.Item>
                        <Dropdown.Item href="#/action-5" onClick={()=>this.props.onRecommend('skipgram')} >Skip-Gram</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            
                // <div className="form-inline" >
                //     <div className="form-check">
                //         <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="option1" checked />
                //         <label className="form-check-label" for="exampleRadios1">
                //             Embedding based on  based 
                //         </label>
                //     </div>
                //     <div className="form-check">
                //         <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="option2" />
                //         <label className="form-check-label" for="exampleRadios2">
                //             Embedding based on 
                //         </label>
                //     </div>
                //     <label className="btn btn-outline-success my-2 my-sm-0" onClick={this.handleSubmit}>Recommend</label>
                // </div>

        );
    }
}

export default Recommend;