import React, { useContext, useState, useEffect } from 'react';
import { setImage, removeImage } from '../store/imageSlice';
import { gql, useMutation } from '@apollo/client';
import { updateField, resetField } from '../store/createProjectSlice';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import { useSelector, useDispatch } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import ContextFunc from '../context/ContextFunc';
const createProject = gql`
  mutation CreateProject($createProjectInput: CreateProjectInput!) {
    createProject(createProjectInput: $createProjectInput) {
      project_id
      project_name
      target_amount
      username
      pledge_amount
      description
      catagory
      end_date
      image
    }
  }
`;
const options = [
  { name: 'Art', id: 1 },
  { name: 'Comics & Illustration', id: 2 },
  { name: 'Design & Tech', id: 3 },
  { name: 'Film', id: 4 },
  { name: 'Food & Craft', id: 5 },
  { name: 'Games', id: 6 },
  { name: 'Music', id: 7 },
  { name: 'Publishing', id: 8 },
];
const CreateProject = () => {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const image = useSelector((state) => state.image);
  const [minDate, setMinDate] = useState('');
  const data = useSelector((state) => state.createProject.formData);
  const jwt = useSelector((state) => state.jwt);
  const tempUser = useSelector((state) => state.tempUser);
  const { refetch } = useContext(ContextFunc);
  const [imgObj, setImgObj] = useState({});
  const [show, setShow] = useState(false);
  const handleCatagory = (ev) => {
    dispatch(updateField({ field: 'catagory', value: ev }));
  };
  const handleClose = () => {
    setShow(false);
    nav('/');
  };
  const handleLogin = () => {
    setShow(false);
    nav('/login');
  };
  const handleShow = () => setShow(true);
  const [project, { loading }] = useMutation(createProject);
  const handleUpload = (e) => {
    setImgObj(e.target.files[0]);
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      dispatch(setImage(reader.result));
    };
    reader.onerror = (err) => {
      console.log(err);
    };
  };
  useEffect(() => {
    if (jwt.length === 0) {
      handleShow();
    }
  }, [jwt]);
  //added this to set the minimum in date input
  useEffect(() => {
    const getTodayDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setMinDate(getTodayDate());
  }, []);
  const handleInput = (e) => {
    const { name, value } = e.target;
    dispatch(updateField({ field: name, value }));
  };
  const handleClick = async () => {
    if (
      !data.project_title ||
      !data.project_description ||
      !data.end_date ||
      data.target_amount === 0 ||
      !imgObj
    ) {
      enqueueSnackbar('Make Sure No Field Is Empty', {
        style: { background: 'white', color: 'red' },
      });
      return null;
    }
    enqueueSnackbar(`↻ This May Take A Bit....`, {
      style: { background: 'white', color: 'red' },
    });
    const formData = new FormData();
    formData.append('file', imgObj);
    formData.append('project_name', 'StintStewarship');
    //port of kubernetes cluster
    fetch('http://localhost:3000/project/upload', {
      method: 'POST',
      body: formData,
    })
      .then((resp) => {
        resp.text().then((res) => {
          project({
            variables: {
              createProjectInput: {
                username: tempUser.username,
                project_name: data.project_title,
                description: data.project_description,
                end_date: data.end_date,
                catagory: data.catagory,
                image: res,
                target_amount: +data.target_amount,
              },
            },
          })
            .then((response) => {
              if (response) {
                dispatch(removeImage());
                dispatch(resetField());
                nav('/');
                refetch();
                enqueueSnackbar('Project Was Successfully Created!', {
                  variant: 'success',
                });
              }
            })
            .catch((err) => {
              if (err.message.includes('duplicate key error')) {
                enqueueSnackbar(`❗ Project With This Name Already Exists`, {
                  style: { background: 'white', color: 'red' },
                });
              } else {
                enqueueSnackbar(`❗ ${err.message}`, {
                  style: { background: 'white', color: 'red' },
                });
              }
            });
        });
      })
      .catch((err) => console.log(err));
    //this solved the two click error!
  };
  return (
    <div className='d-md-grid p-1'>
      {jwt && (
        <div className='text-center'>
          <h4
            className='w-25 p-3 border-bottom border-3 border-success-subtle opacity-75'
            style={{ margin: 30 }}
          >
            Make A Project!
          </h4>
          <Form
            className='w-25 text-center p-3'
            style={{
              borderRight: '2px solid lightgray',
              margin: 40,
              opacity: '90%',
              height: 400,
              overflowY: 'scroll',
            }}
          >
            <Form.Group style={{ opacity: '100%' }}>
              <Form.Label>Your Username</Form.Label>
              <Form.Control
                type='email'
                name='username'
                disabled
                value={tempUser.username}
                placeholder='Username'
              />
            </Form.Group>
            <hr style={{ color: 'red' }} />
            <Form.Group style={{ opacity: '100%' }}>
              <Form.Label>Project Title</Form.Label>
              <Form.Control
                type='text'
                value={data.project_title.trimStart()}
                placeholder='Project Title'
                name='project_title'
                onChange={handleInput}
              />
            </Form.Group>
            <hr style={{ color: 'red' }} />

            <Form.Group style={{ opacity: '100%' }}>
              <Form.Label>Project Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={1}
                value={data.project_description.trimStart()}
                name='project_description'
                placeholder='Project Description'
                onChange={handleInput}
              />
            </Form.Group>
            <hr style={{ color: 'red' }} />
            <Form.Group style={{ opacity: '100%' }}>
              <Form.Label>Project Catagory</Form.Label>
              {/* dropdown here */}
              <Dropdown>
                <Dropdown.Toggle variant='primary' id='dropdown-basic'>
                  Select A Catagory
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {options.map((option) => (
                    <Dropdown.Item
                      key={option.id}
                      value={option.name}
                      onClick={() => {
                        handleCatagory(option.name);
                      }}
                    >
                      {option.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <br />
              <Form.Control
                name='catagory'
                disabled
                value={data.catagory}
                placeholder='Catagory'
              />
            </Form.Group>
            <hr style={{ color: 'red' }} />

            <Form.Group style={{ opacity: '100%' }}>
              <Form.Label>Project Image</Form.Label>
              <Form.Control
                type='file'
                accept='image/*'
                onChange={(e) => handleUpload(e)}
              />
            </Form.Group>
            <hr style={{ color: 'red' }} />

            <Form.Group style={{ opacity: '100%' }}>
              <Form.Label>Target Amount</Form.Label>
              <Form.Control
                type='number'
                value={data.target_amount !== 0 && data.target_amount}
                name='target_amount'
                min={1}
                placeholder='Project Target'
                onChange={handleInput}
              />
            </Form.Group>
            <hr style={{ color: 'red' }} />

            <Form.Group style={{ opacity: '100%' }}>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type='date'
                value={data.end_date !== 0 && data.end_date}
                name='end_date'
                pattern='\d{4}-\d{2}-\d{2}'
                min={minDate}
                placeholder='Select End Date'
                onChange={handleInput}
              />
            </Form.Group>
            <hr style={{ color: 'red' }} />

            <Form.Group style={{ opacity: '100%' }}>
              {data && (
                <Button
                  type='reset'
                  variant='danger'
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    dispatch(removeImage());
                    dispatch(resetField());
                    enqueueSnackbar('Reset ↻', {
                      style: { color: 'red', background: 'white' },
                      preventDuplicate: true,
                    });
                  }}
                >
                  Reset
                </Button>
              )}
            </Form.Group>
          </Form>
          {data.project_title && (
            <Card
              style={{
                width: '40rem',
                left: 650,
                maxHeight: 500,
                top: -500,
                opacity: '90%',
                overflowY: 'scroll',
              }}
            >
              <Card.Img variant='top' src={image} />
              <Card.Body>
                <Card.Title>This is how it'll be looking</Card.Title>
                <br />
                <Card.Text>
                  {tempUser.username && (
                    <>
                      <b>Username</b>
                      <br />
                      {tempUser.username}
                      <br />
                    </>
                  )}
                  {data.project_title && (
                    <>
                      <br />
                      <b>Project Title</b>
                      <br />
                      {data.project_title && data.project_title}
                      <br />
                    </>
                  )}
                  {data.project_description && (
                    <>
                      <br />
                      <b>Project Description</b>
                      <br />
                      {data.project_description && data.project_description}
                      <br />
                    </>
                  )}
                  {data.catagory && (
                    <>
                      <br />
                      <b>Project Catagory</b>
                      <br />
                      {data.catagory && data.catagory}
                      <br />
                    </>
                  )}
                  {data.target_amount !== 0 && (
                    <>
                      <br />
                      <b>Target Amount</b>
                      <br />
                      {data.target_amount && data.target_amount}
                      <br />
                    </>
                  )}
                  {data.end_date && (
                    <>
                      <br />
                      <b>End Date</b>
                      <br />
                      {data.end_date && data.end_date}
                    </>
                  )}
                </Card.Text>
                <Card.Footer
                  style={{ background: 'transparent' }}
                  className='p-4'
                >
                  <Button variant='primary' onClick={handleClick}>
                    {loading ? (
                      <Spinner
                        animation='border'
                        variant='secondary'
                        size='sm'
                      />
                    ) : (
                      'Create'
                    )}
                  </Button>
                </Card.Footer>
              </Card.Body>
            </Card>
          )}
        </div>
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

export default CreateProject;
