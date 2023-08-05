import React, { useContext, useEffect, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import ContextFunc from '../context/ContextFunc';

const deleteProjects = gql`
  mutation DeleteProject($deleteProject: DeleteProject!) {
    DeleteProject(deleteProject: $deleteProject)
  }
`;

const YourProjects = () => {
  const nav = useNavigate();
  const { refetch, faqs } = useContext(ContextFunc);
  const [delProjects, options] = useMutation(deleteProjects);
  const jwt = useSelector((state) => state.jwt);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const projData = useSelector((state) => state.projects[0]);
  const tempUser = useSelector((state) => state.tempUser);
  const handleShow = () => setShow(true);
  const handleShow1 = () => setShow1(true);
  const handleClose1 = () => {
    setShow1(false);
    nav('/');
  };
  const handleClose = () => {
    setShow(false);
    nav('/');
  };
  const handleLogin = () => {
    setShow(false);
    nav('/login');
  };
  useEffect(() => {
    if (jwt.length === 0) {
      handleShow();
    }
  }, [jwt]);
  useEffect(() => {
    if (
      projData &&
      projData.filter((project) => project.username === tempUser.username)
        .length === 0
    ) {
      handleShow1();
    }
  }, [projData, tempUser.username]);
  const handleDel = (temp) => {
    delProjects({
      variables: {
        deleteProject: {
          project_name: temp.project_name,
          username: tempUser.username,
        },
      },
    })
      .then((res) => {
        if (res) {
          enqueueSnackbar('✅ Project Deleted', {
            style: { color: 'green', background: 'white' },
          });
        }
        faqs.refetch();
        refetch();
      })
      .catch((err) => {
        enqueueSnackbar(`❗ ${err.message}`, {
          style: { color: 'red', background: 'white' },
        });
      });
  };
  const projs =
    projData &&
    projData.filter((project) => project.username === tempUser.username);
  const projects =
    projs &&
    projs.map((project) => {
      if (project.username === tempUser.username) {
        return (
          <div
            className='col-md-3 rounded'
            style={{
              marginTop: 20,
              marginLeft: 100,
              boxShadow: '0 2px 20px lightgray',
            }}
            key={project.project_id}
          >
            <Card className='h-100'>
              <Card.Img
                variant='top'
                src={project.image}
                style={{ height: 250 }}
              />
              <Card.Body className='text-center m-1'>
                <Card.Title>{project.project_name}</Card.Title>
                <Card.Text>Description: {project.description}</Card.Text>
                <Card.Text>Category: {project.catagory}</Card.Text>
                <Card.Text>Target Amount: {project.target_amount}</Card.Text>
                <Card.Text>Pledged Amount: {project.pledge_amount}</Card.Text>
                <Card.Text>End Date: {project.end_date}</Card.Text>
                <Button
                  variant='danger'
                  onClick={() => {
                    handleDel(project);
                  }}
                >
                  {options.loading ? (
                    <Spinner size='sm' animation='grow' />
                  ) : (
                    'Delete'
                  )}
                </Button>
              </Card.Body>
            </Card>
          </div>
        );
      } else {
        return '';
      }
    });
  return (
    <div className='card-group'>
      {projects && projects.length >= 1 ? (
        projects
      ) : (
        <Modal
          show={show1}
          onHide={handleClose1}
          backdrop='static'
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>No Owned Projects</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            You Do Not Own Any Projects, Please Create One
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleClose1}>
              Go Back
            </Button>
            <Button
              variant='primary'
              onClick={() => {
                nav('/create');
              }}
            >
              Create One
            </Button>
          </Modal.Footer>
        </Modal>
      )}
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
          <Modal.Body>You Need To Log In To See Your Projects</Modal.Body>
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

export default YourProjects;
