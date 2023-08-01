import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { enqueueSnackbar } from 'notistack';
const sign = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      user_id
      user_name
      username
      password
    }
  }
`;
const SignUp = () => {
  const nav = useNavigate();
  const [user, setUser] = useState({
    name: '',
    username: '',
    password: '',
    confirmpassword: '',
  });
  const [signUser, { loading }] = useMutation(sign);
  const handleSign = () => {
    if (/\d/.test(user.name)) {
      enqueueSnackbar('❗ Name Must Not Have A Number', {
        style: { background: 'white', color: 'red' },
        preventDuplicate: 'true',
      });
    } else {
      if (user.name && user.password && user.username && user.confirmpassword) {
        if (
          !user.username.match(
            /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/
          )
        ) {
          enqueueSnackbar('❗ Username Must Be An Email', {
            style: { background: 'white', color: 'red' },
            preventDuplicate: 'true',
          });
        } else {
          if (user.password.length < 8) {
            enqueueSnackbar('❗ Password Must Be Longer Than 8 Characters', {
              style: { color: 'red', background: 'white' },
              preventDuplicate: 'true',
            });
          } else {
            if (user.password === user.confirmpassword) {
              //mutation goes here
              signUser({
                variables: {
                  createUserInput: {
                    user_name: user.name,
                    username: user.username,
                    password: user.confirmpassword,
                  },
                },
              })
                .then(() => {
                  enqueueSnackbar(
                    '✅ Registered Successfully, Please Login...',
                    {
                      style: { color: 'green', background: 'white' },
                      preventDuplicate: 'true',
                    }
                  );
                  nav('/login');
                })
                .catch((err) => {
                  if (err.message.includes('duplicate key error')) {
                    enqueueSnackbar(`❗ User Already Exists`, {
                      style: { color: 'red', background: 'white' },
                      preventDuplicate: 'true',
                    });
                  } else {
                    enqueueSnackbar(`❗ ${err.message}`, {
                      style: { color: 'red', background: 'white' },
                      preventDuplicate: 'true',
                    });
                  }
                });
              setUser({
                name: '',
                username: '',
                password: '',
                confirmpassword: '',
              });
            } else {
              enqueueSnackbar('❗ Passwords Do Not Match', {
                style: { color: 'red', background: 'white' },
                preventDuplicate: 'true',
              });
            }
          }
        }
      } else {
        enqueueSnackbar('❗ Make Sure All The Fields Are Not Empty', {
          style: { color: 'red', background: 'white' },
          preventDuplicate: 'true',
        });
      }
    }
  };
  return (
    <div
      className='form-control'
      style={{
        background: 'transparent',
        border: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '75vh',
      }}
    >
      <Form
        className='text-center w-25 p-5 rounded border-1'
        style={{
          background: 'white',
          boxShadow: '1px 10px 20px 10px lightgray',
          height: 400,
          maxHeight: 500,
          overflowX: 'scroll',
        }}
      >
        <h4>Sign Up</h4>
        <br />
        <Form.Group style={{ opacity: '100%' }}>
          <Form.Control
            type='text'
            name='name'
            value={user.name}
            placeholder='Name'
            onChange={(e) => {
              setUser((prev) => ({
                ...prev,
                name: e.target.value.trimStart(),
              }));
            }}
          />
        </Form.Group>
        <hr style={{ color: 'blue' }} />
        <Form.Group style={{ opacity: '100%' }}>
          <Form.Control
            type='email'
            name='username'
            value={user.username}
            placeholder='Email'
            onChange={(e) => {
              setUser((prev) => ({
                ...prev,
                username: e.target.value.trimStart(),
              }));
            }}
          />
        </Form.Group>
        <hr style={{ color: 'blue' }} />
        <Form.Group style={{ opacity: '100%' }}>
          <Form.Control
            type='password'
            value={user.password}
            placeholder='Password'
            onChange={(e) => {
              setUser((prev) => ({
                ...prev,
                password: e.target.value.trimStart(),
              }));
            }}
          />
        </Form.Group>
        <hr style={{ color: 'blue' }} />
        <Form.Group style={{ opacity: '100%' }}>
          <Form.Control
            type='password'
            value={user.confirmpassword}
            placeholder='Confirm Password'
            onChange={(e) => {
              setUser((prev) => ({
                ...prev,
                confirmpassword: e.target.value.trimStart(),
              }));
            }}
          />
        </Form.Group>
        <hr style={{ color: 'blue' }} />
        <Form.Group style={{ paddingTop: 20 }}>
          <Button type='button' onClick={handleSign}>
            {loading ? <Spinner size='sm' animation='border' /> : 'Sign Up'}
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default SignUp;
