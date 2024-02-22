import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

const pages = [
    {'name': 'API','href': 'https://rare.cohd.io/api'},
    {'name': 'GitHub', 'href': 'https://github.com/stormliucong/oard-react'},
    {'name': 'Tutorial', 'href': 'https://github.com/stormliucong/oard-react/tree/master/tutorial'},
    {'name': 'COHD', 'href': 'https://cohd.io/'},
    {'name': 'WengLab', 'href': 'https://people.dbmi.columbia.edu/~chw7007/'},
    {'name': 'CUIMC/DBMI', 'href': 'https://www.dbmi.columbia.edu/'},
];

const AppBarComp = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
    
  };

  const handleCloseNavMenu = (href) => {
      if(href != 'close'){
        window.open(href)
      }
      setAnchorElNav(null);
  };



  return (
    <AppBar position="static">
      <Container maxWidth="xl" sx={{padding:3}}>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            OARD Web App
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={() => handleCloseNavMenu('close')}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page,i) => (
                <MenuItem key={i} onClick={() => handleCloseNavMenu(page.href)}>
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
          >
            OARD Web App
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page,i) => (
              <Button
                key={i}
                onClick={()=> handleCloseNavMenu(page.href)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default AppBarComp;
