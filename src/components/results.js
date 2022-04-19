import React, { Component } from 'react';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import ListSubheader from '@mui/material/ListSubheader';
import Button from '@mui/material/Button';
import SinelgResultDisplayComp from './singleresult'


class ResultComp extends Component {

    render() {

        return (
            <List aria-label="mailbox folders" sx={{ display: 'flex', flexDirection: "column", alignItems: "stretch" }}>
                {this.props.apiResultsDisplay &&
                    <ListSubheader>
                        {this.props.apiResults.length} Results returned. Please note if the count number is less than ten, no results will be returned.
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