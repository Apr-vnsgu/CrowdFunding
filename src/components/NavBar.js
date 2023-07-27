import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeJwt } from '../store/loginSlice';
import './Projects.css';
import { enqueueSnackbar } from 'notistack';
import { removeTempUser } from '../store/tempUser';

const NavBarPanel = () => {
  const dispatch = useDispatch();
  const jwt = useSelector((state) => state.jwt);
  const tempUser = useSelector((state) => state.tempUser);
  const signOut = () => {
    dispatch(removeJwt());
    dispatch(removeTempUser());
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
          <Navbar.Text>
            {jwt.length !== 0 && <>{`Hello ${tempUser.user_name}!`}</>}
            {jwt.length === 0 && <>{`Hello Traveller!`}</>}
          </Navbar.Text>
          <Nav>
            <Nav.Link
              to='/'
              id='navLink'
              as={Link}
              style={{
                paddingRight: 20,
                opacity: '90%',
              }}
            >
              Discover
            </Nav.Link>
            <Nav.Link
              to='/create'
              as={Link}
              id='navLink'
              style={{
                borderLeft: '1px solid lightgray',
                paddingLeft: 20,
                paddingRight: 20,
                opacity: '90%',
              }}
            >
              Make A Project
            </Nav.Link>
            {jwt.length === 0 && (
              <Nav.Link
                to='/login'
                as={Link}
                id='navLink'
                style={{
                  borderLeft: '1px solid lightgray',
                  paddingLeft: 20,
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
