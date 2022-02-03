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


class SinelgResultDisplayComp extends Component {
    state = {open: false}

    handleClick = ()=>{
        this.setState({open: !this.state.open})
    }

    render() {    
        console.log(this.props.service)    
        if(this.props.service == 'association'){
            var primaryName = this.props.result.concept_name_2 + ' (' + this.props.result.concept_code_2 +')' 
            var sencondaryName = ''
            var thirdName = ''
            const zDetails = this.props.result.z_details
            console.log(zDetails)
            switch (this.props.method) {
                case 'chiSquare':
                    console.log('negative 1');
                    sencondaryName = 'Chi-square: ' + this.props.result.ws_cs
                    thirdName = ''
                    break;
                case 'obsExpRatio': // foo is 0 so criteria met here so this block will run
                    console.log(0);
                    sencondaryName = 'LnRatio: ' + this.props.result.ws_ln_ratio
                    break;
                // NOTE: the forgotten break would have been here
                case 'relativeFrequency': // no break statement in 'case 0:' so this case will run as well
                    console.log(1);
                    sencondaryName = 'Relative frequency: ' + this.props.result.ws_relative_frequency
                    break; // it encounters this break so will not continue into 'case 2:'
                case 'jaccardIndex':
                    console.log(2);
                    sencondaryName = 'Jaccard Index: ' + this.props.result.ws_jaccard_index
                    break;
                default:
                    console.log('default');
            }
            
            return (
                <React.Fragment >
                    <Divider />
                    <ListItemButton onClick={this.handleClick}>
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={primaryName} secondary={sencondaryName} />
                        {this.state.open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {zDetails.map((detail,i) => {
                                return (
                                    <React.Fragment>
                                        <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemIcon>
                                            <StarBorder />
                                        </ListItemIcon>
                                        <ListItemText primary={detail.concept_name_1} secondary={
                                            'Pair Count: '+ detail.concept_pair_count + 
                                            '; Query weight: ' + detail.w}/>
                                        </ListItemButton>
                                    </React.Fragment>
                                )            
                            })} 
                        </List>
                    </Collapse>
                    
                </React.Fragment>
                
            );
        }
        if(this.props.service == 'frequencies'){
            var isPairFreq = false
            var primaryName = ''
            var sencondaryName = ''
            var thirdName = ''
            if(this.props.method == 'singleConceptFreq'){
                isPairFreq = false
            }
            else if(this.props.method == 'mostFrequency'){
                console.log(this.props.result)
                if('concept_code' in this.props.result){
                    isPairFreq = false
                }
                else{
                    //pair concept
                    isPairFreq = true
                }
            }
            else {
                isPairFreq = true
            }
            if(isPairFreq){
                primaryName = this.props.result.concept_name_1 + ' (' + this.props.result.concept_code_1 + ')' + '---' + this.props.result.concept_name_2 + ' (' + this.props.result.concept_code_2 + ')'
                sencondaryName = 'Concept Pair Frequency: ' + this.props.result.concept_frequency + ' (' + this.props.result.concept_pair_count + ')'
                return (
                    <React.Fragment>
                        <Divider />
                        <ListItemButton onClick={this.handleClick}>
                            <ListItemIcon>
                                <InboxIcon />
                            </ListItemIcon>
                            <ListItemText primary={primaryName} secondary={sencondaryName} />
                            {this.state.open ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                               
                                <ListItemButton sx={{ pl: 4 }}>
                                <ListItemIcon>
                                    <StarBorder />
                                </ListItemIcon>
                                <ListItemText primary={this.props.result.concept_name_1 + ' (' + this.props.result.concept_code_1 + ')'} 
                                secondary={
                                    'Concept Count: '+ this.props.result.concept_count_1 }/>
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }}>
                                <ListItemIcon>
                                    <StarBorder />
                                </ListItemIcon>
                                <ListItemText primary={this.props.result.concept_name_2 + ' (' + this.props.result.concept_code_2 + ')'} 
                                secondary={
                                    'Concept Count: '+ this.props.result.concept_count_2 }/>
                                </ListItemButton>
                            </List>
                        </Collapse>        
                    </React.Fragment>
                    
                );
            }
            else{
                primaryName = this.props.result.concept_name + ' (' + this.props.result.concept_code + ')'
                sencondaryName = 'Concept Frequency: ' + this.props.result.concept_frequency + ' (' + this.props.result.concept_count + ')'
                return (
                    <React.Fragment>
                        <Divider />
                        <ListItemButton>
                            <ListItemIcon>
                                <InboxIcon />
                            </ListItemIcon>
                            <ListItemText primary={primaryName} secondary={sencondaryName} />
                        </ListItemButton>     
                    </React.Fragment>
                    
                );

            }
        }

    }
}

export default SinelgResultDisplayComp;