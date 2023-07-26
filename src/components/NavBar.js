import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeJwt } from '../store/loginSlice';
import { enqueueSnackbar } from 'notistack';

const NavBarPanel = () => {
  const dispatch = useDispatch();
  const jwt = useSelector((state) => state.jwt);
  const signOut = () => {
    dispatch(removeJwt());
    localStorage.removeItem('jwt');
    enqueueSnackbar('✅ Signed Out', {
      style: { background: 'white', color: 'green' },
    });
  };
  return (
    <div
      style={{ background: 'transparent' }}
      className='border-bottom border-1'
    >
      <Navbar>
        <Container fluid>
          <Navbar.Brand href='/' as={Link}>
            CrowdFunding
          </Navbar.Brand>
          <Nav>
            <Nav.Link
              to='/'
              as={Link}
              style={{
                paddingRight: 20,
                color: 'black',
                opacity: '90%',
              }}
            >
              Discover
            </Nav.Link>
            <Nav.Link
              to='/create'
              as={Link}
              style={{
                borderLeft: '1px solid lightgray',
                paddingLeft: 20,
                paddingRight: 20,
                opacity: '90%',
                color: 'black',
              }}
            >
              Make A Project
            </Nav.Link>
            {jwt.length === 0 && (
              <Nav.Link
                to='/login'
                as={Link}
                style={{
                  borderLeft: '1px solid lightgray',
                  paddingLeft: 20,
                  color: 'black',
                  opacity: '90%',
                }}
              >
                Login
              </Nav.Link>
            )}
            {jwt.length !== 0 && <Button onClick={signOut}>Sign Out</Button>}
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBarPanel;
