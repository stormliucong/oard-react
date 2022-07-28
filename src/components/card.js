import React, { Component } from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import CardContent  from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
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
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                          OARD is able to return (1) single concept frequency (or most freqeuent concepts if Query Concept List 1 is not provided);
                          (2) paired concept cofrequencies or associations (or most frequently co-occurring / most associated concepts if Query Concept 2 is not provided).
                    </Typography>
                </CardContent>
                    <Button size="small" href="https://github.com/stormliucong/oard-react/tree/master/tutorial">Learn More</Button>
                </CardActionArea>
                </Card>
                </Grid>
            </Container>
          );

    }
}
export default CardComp;
