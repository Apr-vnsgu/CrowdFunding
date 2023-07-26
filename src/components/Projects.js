import React, { useContext, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import './Projects.css';
import ContextFunc from '../context/ContextFunc';
import { setTemp } from '../store/tempData';

const Projects = () => {
  const dispatch = useDispatch();
  const projData = useSelector((state) => state.projects[0]);
  const temp = useSelector((state) => state.temp);
  const { loading } = useContext(ContextFunc);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = (project) => {
    setShow(true);
    dispatch(setTemp(project));
  };
  const projects =
    projData &&
    projData.map((project) => {
      return (
        <div
          className='col-md-3 rounded projects'
          style={{
            marginTop: 20,
            marginLeft: 100,
            boxShadow: '0 2px 20px lightgray',
          }}
          onClick={() => handleShow(project)}
          key={project.project_id}
        >
          <Card className='h-100'>
            <div className='text-center'>
              <Card.Img
                src={project.image}
                alt={project.project_name}
                style={{ height: 250 }}
              />
            </div>
            <Card.Body className='text-center'>
              <Card.Title>{project.project_name}</Card.Title>
              <Card.Text>{project.description}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      );
    });
  return (
    <div className='card-group'>
      {loading && (
        <div
          className='card align-items-center p-5'
          style={{
            background: 'transparent',
            border: 0,
          }}
        >
          <Spinner animation='border' variant='secondary' />
        </div>
      )}
      {projects && projects}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop='static'
        keyboard={false}
        animation={true}
        size='lg'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{temp.project_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='card-group p-5'>
          <img
            alt={temp.project_name}
            src={temp.image}
            style={{ height: 200, width: 200, borderRadius: 100 }}
          />
          <ul className='m-5'>
            <li>Description: {temp.description}</li>
            <li>End Date: {temp.end_date}</li>
            <li>
              Owner: <a href='/'>{temp.username}</a>
            </li>
            <li>Amount To Reach: {temp.target_amount}</li>
            <li>Total Pledged Amount: {temp.pledge_amount}</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Close
          </Button>
          <Button variant='info'>Pledge</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Projects;
