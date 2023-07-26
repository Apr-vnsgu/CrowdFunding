import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavBarPanel = () => {
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
                borderRight: '1px solid lightgray',
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
                paddingLeft: 20,
                opacity: '90%',
                color: 'black',
              }}
            >
              Create A Project
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBarPanel;
