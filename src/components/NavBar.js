import React, { useEffect, useState, useContext } from 'react';
import {
  Navbar,
  Nav,
  Container,
  Button,
  Badge,
  Modal,
  Accordion,
  Form,
  Spinner,
} from 'react-bootstrap';
import ContextFunc from '../context/ContextFunc';
import { gql, useMutation } from '@apollo/client';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeJwt } from '../store/loginSlice';
import './Projects.css';
import { enqueueSnackbar } from 'notistack';
import { removeTempUser } from '../store/tempUser';
const writeAns = gql`
  mutation WriteAnswer($writeAnswer: FAQInput!) {
    writeAnswer(writeAnswer: $writeAnswer)
  }
`;
const NavBarPanel = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const jwt = useSelector((state) => state.jwt);
  const faq = useSelector((state) => state.faq[0]);
  const tempUser = useSelector((state) => state.tempUser);
  const [x, setX] = useState([]);
  const [answer, setAnswer] = useState('');
  const [ans, ansOpt] = useMutation(writeAns);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { faqs } = useContext(ContextFunc);
  const signOut = () => {
    dispatch(removeJwt());
    dispatch(removeTempUser());
    localStorage.removeItem('jwt');
    enqueueSnackbar('✅ Signed Out', {
      style: { background: 'white', color: 'green' },
    });
  };
  useEffect(() => {
    setAnswer('');
    setX([]);
    if (faq) {
      faq.forEach((obj) => {
        if (obj.to === tempUser.username) {
          setX((prev) => {
            return [...prev, obj];
          });
        }
      });
    }
  }, [faq, tempUser.username]);
  const handleAns = (obj) => {
    if (answer.length === 0) {
      enqueueSnackbar('❗ Answer Cannot Be Empty', {
        style: { color: 'red', background: 'white' },
        preventDuplicate: true,
      });
    } else {
      ans({
        variables: {
          writeAnswer: {
            id: obj.id,
            project_name: obj.project_name,
            answer,
          },
        },
      })
        .then((res) => {
          if (res) {
            enqueueSnackbar('✅ Answer Posted', {
              style: { color: 'green', background: 'white' },
              preventDuplicate: true,
            });
            faqs.refetch();
            setShow(false);
            setAnswer('');
          }
        })
        .catch((err) => {
          enqueueSnackbar(err.message, {
            style: { color: 'red', background: 'white' },
          });
        });
    }
  };
  return (
    <div
      style={{ background: 'transparent' }}
      className='border-bottom border-1'
    >
      <Navbar collapseOnSelect expand='lg'>
        <Container fluid>
          <Navbar.Brand href='/' as={Link}>
            CrowdFunding
          </Navbar.Brand>
          <Navbar.Text
            style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
          >
            {jwt.length !== 0 && <>{`Hello ${tempUser.user_name}!`}</>}
            {jwt.length === 0 && <>{`Hello Traveller!`}</>}
          </Navbar.Text>
          {jwt && (
            <div
              id='div-ques'
              style={{
                paddingRight: 20,
                opacity: '90%',
              }}
              onClick={() => {
                nav('/bookmarks');
              }}
            >
              Bookmarks{' '}
              <Badge
                bg={
                  tempUser.bookmarks && tempUser.bookmarks.length === 0
                    ? 'danger'
                    : 'info'
                }
                style={{ borderRadius: '100%' }}
              >
                {tempUser.bookmarks && tempUser.bookmarks.length}
              </Badge>
            </div>
          )}
          <Navbar.Text>
            {jwt && (
              <div
                id='div-ques'
                style={{
                  paddingRight: 20,
                  opacity: '90%',
                }}
                onClick={() => {
                  handleShow();
                }}
              >
                Questions <Badge>{x.length}</Badge>
              </div>
            )}
          </Navbar.Text>
          <Nav>
            <Nav.Link
              to='/discover'
              id='navLink'
              as={Link}
              style={{
                paddingRight: 20,
                paddingLeft: 20,
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
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Answer These Questions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Accordion>
            {x &&
              x.map((obj) => (
                <Accordion.Item eventKey={obj.id}>
                  <Accordion.Header>
                    Q. {obj.question} ----for:-{obj.project_name} ------from:-{' '}
                    {obj.from}
                  </Accordion.Header>
                  <Accordion.Body>
                    {obj.answer.length === 0 ? (
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <Form.Group>
                          <Form.Control
                            type='text'
                            placeholder='Write An Answer'
                            value={answer}
                            onChange={(e) => {
                              setAnswer(e.target.value.trimStart());
                            }}
                            size='sm'
                          />
                          <br />
                          <Button
                            variant='primary'
                            onClick={() => handleAns(obj)}
                            size='sm'
                          >
                            {ansOpt.loading ? (
                              <Spinner animation='border' size='sm' />
                            ) : (
                              'Post'
                            )}
                          </Button>
                        </Form.Group>
                      </Form>
                    ) : (
                      'A. ' + obj.answer
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
          </Accordion>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NavBarPanel;
