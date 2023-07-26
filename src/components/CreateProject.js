import React, { useContext, useState } from 'react';
import { setImage, removeImage } from '../store/imageSlice';
import { gql, useMutation } from '@apollo/client';
import { updateField, resetField } from '../store/createProjectSlice';
import { Button, Form, Card } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
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
      end_date
      image
    }
  }
`;
const CreateProject = () => {
  const { refetch } = useContext(ContextFunc);
  const [imgObj, setImgObj] = useState({});
  const [imageUrl, setImageUrl] = useState('');
  const [project, { loading }] = useMutation(createProject);
  const dispatch = useDispatch();
  const nav = useNavigate();
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
  const image = useSelector((state) => state.image);
  const data = useSelector((state) => state.createProject.formData);
  const handleInput = (e) => {
    const { name, value } = e.target;
    dispatch(updateField({ field: name, value }));
  };
  const handleClick = async () => {
    const formData = new FormData();
    formData.append('file', imgObj);
    formData.append('project_name', 'StintStewarship');
    fetch('http://localhost:3000/project/upload', {
      method: 'POST',
      body: formData,
    })
      .then((resp) => {
        resp.text().then((res) => {
          setImageUrl(res);
        });
      })
      .catch((err) => console.log(err));
    //lastly changed this
    (await imageUrl) &&
      project({
        variables: {
          createProjectInput: {
            username: data.username,
            project_name: data.project_title,
            description: data.project_description,
            end_date: data.end_date,
            image: imageUrl,
            target_amount: +data.target_amount,
          },
        },
      })
        .then((response) => {
          if (response) {
            enqueueSnackbar('Project Creation Success');
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
          console.log(err);
        });
  };
  return (
    <div className='d-md-grid p-1'>
      <div className='text-center'>
        <h4 className='w-25 p-3 border-bottom border-3' style={{ margin: 30 }}>
          Create A Project!
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
              value={data.username}
              placeholder='Username'
              onChange={handleInput}
            />
          </Form.Group>
          <hr />
          <Form.Group style={{ opacity: '100%' }}>
            <Form.Label>Project Title</Form.Label>
            <Form.Control
              type='text'
              value={data.project_title}
              placeholder='Project Title'
              name='project_title'
              onChange={handleInput}
            />
          </Form.Group>
          <hr />
          <Form.Group style={{ opacity: '100%' }}>
            <Form.Label>Project Description</Form.Label>
            <Form.Control
              as='textarea'
              rows={1}
              value={data.project_description}
              name='project_description'
              placeholder='Project Description'
              onChange={handleInput}
            />
          </Form.Group>
          <hr />
          <Form.Group style={{ opacity: '100%' }}>
            <Form.Label>Project Image</Form.Label>
            <Form.Control type='file' onChange={(e) => handleUpload(e)} />
          </Form.Group>
          <hr />
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
          <hr />
          <Form.Group style={{ opacity: '100%' }}>
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type='date'
              value={data.end_date !== 0 && data.end_date}
              name='end_date'
              pattern='\d{4}-\d{2}-\d{2}'
              min='2023-07-22'
              placeholder='Select End Date'
              onChange={handleInput}
            />
          </Form.Group>
          <hr />
          <Form.Group style={{ opacity: '100%' }}>
            {image && data && (
              <Button
                type='reset'
                variant='danger'
                style={{ marginLeft: 10 }}
                onClick={() => {
                  dispatch(removeImage());
                  dispatch(resetField());
                  enqueueSnackbar('Success!', {
                    action(id) {
                      return (
                        <>
                          <button
                            onClick={() => {
                              closeSnackbar(id);
                            }}
                            style={{
                              textDecoration: 'none',
                              border: 0,
                              color: 'red',
                              background: 'transparent',
                            }}
                          >
                            Dismiss
                          </button>
                        </>
                      );
                    },
                  });
                }}
              >
                Reset
              </Button>
            )}
          </Form.Group>
        </Form>
        {data.username && (
          <Card
            style={{
              width: '40rem',
              height: 500,
              left: 650,
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
                {data.username && (
                  <>
                    <b>Username</b>
                    <br />
                    {data.username}
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
                {data.target_amount !== 0 && (
                  <>
                    <br />
                    <b>Target Amount</b>
                    <br />
                    {data.target_amount && data.target_amount}
                  </>
                )}
              </Card.Text>
              <Card.Footer
                style={{ background: 'transparent' }}
                className='p-4'
              >
                <Button variant='primary' onClick={handleClick}>
                  {loading ? 'Creating' : 'Create'}
                </Button>
              </Card.Footer>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateProject;
