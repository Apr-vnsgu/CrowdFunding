import React, { useEffect, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Projects.css';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { addCatagory, removeCatagory } from '../store/catagorySlice';
import { fetchProjects, reset } from '../store/catagorizedProjects';
import { setTemp } from '../store/tempData';
const projects = gql`
  query GetProjectsByCatagory($catagory: String!) {
    getProjectsByCatagory(catagory: $catagory) {
      project_id
      image
      end_date
      description
      comments
      pledge_amount
      project_name
      target_amount
      username
      catagory
      likes
      pledges
    }
  }
`;
const catagories = [
  { name: 'All', id: 0, value: ' ' },
  { name: 'Art', id: 1, value: 'Art' },
  { name: 'Comics & Illustration', id: 2, value: 'Comics & Illustration' },
  { name: 'Design & Tech', id: 3, value: 'Design & Tech' },
  { name: 'Film', id: 4, value: 'Film' },
  { name: 'Food & Craft', id: 5, value: 'Food & Craft' },
  { name: 'Games', id: 6, value: 'Games' },
  { name: 'Music', id: 7, value: 'Music' },
  { name: 'Publishing', id: 8, value: 'Publishing' },
];
const Discover = () => {
  const nav = useNavigate();
  const [getCatorized, { data, loading }] = useLazyQuery(projects);
  const catagory = useSelector((state) => state.catagory);
  const catagorizedProjects = useSelector(
    (state) => state.catagorizedProjects[0]
  );
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    nav('/');
  };
  useEffect(() => {
    dispatch(reset());
    dispatch(removeCatagory());
  }, [dispatch]);
  useEffect(() => {
    if (data && data.getProjectsByCatagory) {
      dispatch(fetchProjects(data.getProjectsByCatagory));
    }
  }, [data, dispatch]);
  const logItem = (e) => {
    if (e === catagory) {
      return;
    } else {
      dispatch(addCatagory(e));
      getCatorized({
        variables: {
          catagory: e,
        },
      });
    }
  };
  const lists = (
    <div
      className='d-flex justify-content-center'
      style={{
        borderRadius: 10,
      }}
    >
      <ul>
        {catagories.map((obj) => {
          return (
            <li
              className='m-4'
              id='hover'
              key={obj.id}
              style={{ fontSize: '30px' }}
              onClick={() => logItem(obj.value)}
            >
              {obj.name}
            </li>
          );
        })}
      </ul>
    </div>
  );
  const finalProjects =
    catagorizedProjects &&
    catagorizedProjects.map((project) => (
      <Card
        className='bg-dark text-white m-4'
        key={project.project_id}
        id='bookmark'
        onClick={() => {
          dispatch(setTemp(project));
          nav('/');
        }}
      >
        <Card.Img
          src={project.image}
          alt='Card image'
          style={{ height: 200, opacity: '40%' }}
        />
        <Card.ImgOverlay>
          <Card.Title>{project.project_name}</Card.Title>
          <Card.Text>
            <ul>
              <li>Description: {project.description}</li>
              <li>End Date: {project.end_date}</li>
              <li>
                Owner: <a href='/'>{project.username}</a>
              </li>
              <li>Amount To Reach: {project.target_amount}</li>
              <li>Total Pledged Amount: {project.pledge_amount}</li>
              <li>Catagory: {project.catagory}</li>
            </ul>
          </Card.Text>
        </Card.ImgOverlay>
      </Card>
    ));
  useEffect(() => {
    setShow(false);
    if (finalProjects && finalProjects.length === 0) {
      setShow(true);
    }
  }, [finalProjects, nav]);
  return (
    <div className='container'>
      <div style={{ display: 'grid', placeItems: 'center' }}>
        {loading && <Spinner animation='border' size='sm' />}
      </div>
      {catagory ? '' : lists}
      {finalProjects && finalProjects}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop='static'
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>No Result</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Looks Like There Are No Projects Of That Category Yet
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Go Back
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Discover;
