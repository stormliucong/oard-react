import React, { Component } from 'react';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import SinelgResultDisplayComp from './singleresult'


class ResultComp extends Component {

    render() {

        return (
            <List aria-label="mailbox folders" sx={{ display: 'flex', flexDirection: "column", alignItems: "stretch" }}>
                {this.props.apiResultsDisplay &&
                    <ListSubheader>
                        {this.props.apiResults.length} Result(s) returned. Please note if the patient count is less than 10, no results will be returned.
                    </ListSubheader>
                }
                {this.props.apiResultsDisplay &&
                    this.props.apiResults.map((result, i) =>
                        <SinelgResultDisplayComp key={i} result={result} service={this.props.apiService} method={this.props.apiMethod}>{i}</SinelgResultDisplayComp>
                    )
                }
            </List>
        )
    }

}
export default ResultComp;
