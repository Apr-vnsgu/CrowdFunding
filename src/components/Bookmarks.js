import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const Bookmarks = () => {
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const tempUser = useSelector((state) => state.tempUser);
  const projects = useSelector((state) => state.projects);
  const jwt = useSelector((state) => state.jwt);
  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    nav('/');
  };
  const handleLogin = () => {
    setShow(false);
    nav('/login');
  };
  const bookmarks =
    projects[0] &&
    projects[0]
      .map((project) => {
        if (
          tempUser.bookmarks &&
          tempUser.bookmarks.includes(project.project_name)
        ) {
          return project;
        } else {
          return null;
        }
      })
      .filter((project) => project !== null);
  useEffect(() => {
    if (jwt.length === 0) {
      handleShow();
    }
  }, [jwt]);
  return (
    <div>
      {bookmarks &&
        bookmarks.map((project) => (
          <Card
            className='bg-dark text-white m-4'
            key={project.project_id}
            id='bookmark'
          >
            <Card.Img
              src={project.image}
              alt='Card image'
              style={{ height: 200, opacity: '40%' }}
            />
            <Card.ImgOverlay>
              <Card.Title>{project.project_name}</Card.Title>
              <Card.Text>{project.description}</Card.Text>
              <Card.Text>
                The Pledging For This Project Is Ending On : {project.end_date}
              </Card.Text>
            </Card.ImgOverlay>
          </Card>
        ))}
      {!jwt && (
        <Modal
          show={show}
          onHide={handleClose}
          backdrop='static'
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Not Logged In</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            A User Cannot Create A Project Until He Logs In
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleClose}>
              Go Back
            </Button>
            <Button variant='primary' onClick={handleLogin}>
              Log In
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Bookmarks;
