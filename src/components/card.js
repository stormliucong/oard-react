import React, { Component } from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import { Grid } from '@mui/material';
import CardActionArea from '@mui/material/CardActionArea';

class CardComp extends Component {
    render(){
        return (
            <Container sx={{paddingTop: 5}}>
                <Grid container justifyContent="center">
                    <Card sx={{
                        maxWidth: 1000, 
                       
                            width: {xs: "50%", md: "40%", lg: "30%"}
                    }
                    } >
                <CardActionArea>
                    <CardMedia
                    component="img"
                    image="/OARD_logo.png"
                    alt="green iguana"
                    />
                    {/* <CardContent>
                    <Typography gutterBottom variant="h2" component="div">
                        OARD
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                    OARD: An Open Real-world based Annotation for Rare Diseases and its Associated Phenotypes
                    </Typography>
                    </CardContent> */}
                </CardActionArea>
                </Card>
                </Grid>
            </Container>
          );

    }
}
export default CardComp;