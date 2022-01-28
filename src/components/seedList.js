import React, { Component } from 'react';
import Seed from './seed'
import Recommend from './recommend'

class SeedList extends Component {
    render() {
        if (this.props.seedList.length === 0) return (<p>Current seed list is empty!</p>)

        return (
            <div>
                <Recommend onRecommend={this.props.onRecommend} />
                <div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Concept ID</th>
                                <th scope="col">Concept name</th>
                                <th scope="col">Remove from seed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.seedList.map(seed => <Seed key={seed.conceptId} seed={seed} onRemoveSeedInSeeds={this.props.onRemoveSeedInSeeds}/>)}
                        </tbody>
                    </table>
                </div>
            </div>
            
        );
    }
}

export default SeedList;