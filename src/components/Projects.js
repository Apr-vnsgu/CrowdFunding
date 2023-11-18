import React, { useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { gql, useMutation } from '@apollo/client';
import GooglePayButton from '@google-pay/button-react';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Accordion from 'react-bootstrap/Accordion';
import './Projects.css';
import ContextFunc from '../context/ContextFunc';
import {
  addComment,
  addLike,
  addPledge,
  deleteTemp,
  removeLike,
  setTemp,
} from '../store/tempData';
import { enqueueSnackbar } from 'notistack';
import { updateProject } from '../store/projectSlice';
import { addFaq } from '../store/faqSlice';
import { updateCount } from '../store/countSlice';

const bookmark = gql`
  mutation BookMarkAProject($bookMark: BookMark!) {
    bookMarkAProject(bookMark: $bookMark)
  }
`;

const pledge = gql`
  mutation PledgeAProject($pleadge: PledgeAProject!) {
    pledgeAProject(pleadge: $pleadge) {
      project_id
      project_name
      target_amount
      username
      pledge_amount
    }
  }
`;
const question = gql`
  mutation WriteAQuestion($writeQuestion: FAQInput!) {
    writeAQuestion(writeQuestion: $writeQuestion) {
      id
      project_name
      question
      to
      from
      answer
    }
  }
`;

const like = gql`
  mutation LikeAProject($projectName: String!, $username: String!) {
    likeAProject(project_name: $projectName, username: $username)
  }
`;

const comment = gql`
  mutation Comment($comment: Comment!) {
    comment(comment: $comment)
  }
`;

const Projects = () => {
  const dispatch = useDispatch();
  const projData = useSelector((state) => state.projects[0]);
  const jwt = useSelector((state) => state.jwt);
  const temp = useSelector((state) => state.temp);
  const faq = useSelector((state) => state.faq[0]);
  const count = useSelector((state) => state.count);
  const tempUser = useSelector((state) => state.tempUser);
  const [bookMark, bookmarkOption] = useMutation(bookmark);
  const [likeMut, likeOpt] = useMutation(like);
  const [commentMut, commentOpt] = useMutation(comment);
  const [questMut, quesOpt] = useMutation(question);
  const [pleadgeFunc] = useMutation(pledge);
  const { loading, userOptions } = useContext(ContextFunc);
  const [show, setShow] = useState(false);
  const [comm, setComm] = useState('');
  const [ques, setques] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [pName, setPName] = useState('');
  const [amount, setAmount] = useState(0);
  const handleClose = () => {
    setShow(false);
    setShowButton(false);
    dispatch(deleteTemp());
    setAmount('');
  };
  const handleQues = () => {
    if (ques.length === 0) {
      enqueueSnackbar('❗ Question Should Not Be Empty', {
        style: { background: 'white', color: 'red' },
        preventDuplicate: 'true',
        autoHideDuration: 3000,
      });
    } else {
      //do mutation
      questMut({
        variables: {
          writeQuestion: {
            project_name: temp.project_name,
            question: ques,
            from: tempUser.username,
          },
        },
      })
        .then((res) => {
          if (res.data) {
            enqueueSnackbar(
              `Question Posted For Project ${temp.project_name}`,
              {
                style: { color: 'green', background: 'white' },
                variant: 'success',
              }
            );
            dispatch(addFaq(res.data.writeAQuestion));
            setShow2(false);
            setques('');
          }
        })
        .catch((err) => {
          enqueueSnackbar(`❗ ${err.message}`, {
            style: { background: 'white', color: 'red' },
            preventDuplicate: 'true',
            autoHideDuration: 3000,
          });
        });
    }
  };
  const handleComment1 = () => {
    if (comm.length === 0) {
      enqueueSnackbar('❗ Comment Should Not Be Empty', {
        style: { background: 'white', color: 'red' },
        preventDuplicate: 'true',
        autoHideDuration: 3000,
      });
    } else {
      commentMut({
        variables: {
          comment: {
            comment: comm,
            project_name: temp.project_name,
            username: temp.username,
          },
        },
      })
        .then((res) => {
          if (res.data.comment) {
            enqueueSnackbar(`Commented on project ${temp.project_name}`, {
              style: { color: 'green', background: 'white' },
              variant: 'success',
            });
            dispatch(addComment(comm));
            dispatch(
              updateProject({ ...temp, comments: [...temp.comments, comm] })
            );
            setShow1(false);
            setComm('');
          }
        })
        .catch((err) => {
          enqueueSnackbar(`❗ ${err.message}`, {
            style: { background: 'white', color: 'red' },
            preventDuplicate: 'true',
            autoHideDuration: 3000,
          });
        });
    }
  };
  const handleClose1 = () => {
    setShow1(false);
    setComm('');
  };
  const handleClose2 = () => {
    setShow2(false);
  };
  useEffect(() => {
    if (temp && Object.keys(temp).length > 0) {
      setAmount('');
      setShow(true);
    } else {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temp]);
  const handleShow = (project) => {
    setShow(true);
    setAmount('');
    dispatch(setTemp(project));
  };
  const handleHover = (project) => {
    setAmount('');
    setPName(project.project_name);
  };
  const que = (
    <Accordion>
      {faq &&
        faq.map(
          (obj) =>
            obj.project_name === temp.project_name && (
              <Accordion.Item eventKey={obj.id}>
                <Accordion.Header>
                  Q. {obj.question}------from:- {obj.from}
                </Accordion.Header>
                <Accordion.Body>
                  A. {obj.answer.length === 0 ? 'No Answers Yet' : obj.answer}
                </Accordion.Body>
              </Accordion.Item>
            )
        )}
    </Accordion>
  );
  const handlePledge = (project) => {
    if (jwt.length === 0) {
      enqueueSnackbar('❗ You Must Login First', {
        style: { background: 'white', color: 'red' },
        preventDuplicate: 'true',
        autoHideDuration: 3000,
      });
    } else {
      if (temp.username === tempUser.username) {
        enqueueSnackbar('❗You Cannot Pledge Owned Projects', {
          style: { background: 'white', color: 'red' },
          preventDuplicate: 'true',
          autoHideDuration: 3000,
        });
      } else {
        setShowButton((prev) => !prev);
        setAmount('');
      }
    }
  };
  const handleLike = () => {
    if (jwt.length === 0) {
      enqueueSnackbar('❗ You Must Login First', {
        style: { background: 'white', color: 'red' },
        preventDuplicate: 'true',
        autoHideDuration: 3000,
      });
    } else {
      likeMut({
        variables: {
          projectName: temp.project_name,
          username: tempUser.username,
        },
      })
        .then((res) => {
          if (res) {
            userOptions.refetch();
            if (
              tempUser.likedProjects &&
              tempUser.likedProjects.includes(temp.project_name)
            ) {
              dispatch(updateProject({ ...temp, likes: temp.likes - 1 }));
              dispatch(removeLike());
            } else {
              dispatch(updateProject({ ...temp, likes: temp.likes + 1 }));
              dispatch(addLike());
            }
          }
        })
        .catch((err) => {
          enqueueSnackbar(`❗ ${err.message}`, {
            style: { color: 'red', background: 'white' },
            preventDuplicate: 'true',
          });
        });
    }
  };
  const handleComment = () => {
    if (jwt.length === 0) {
      enqueueSnackbar('❗ You Must Login First', {
        style: { background: 'white', color: 'red' },
        preventDuplicate: 'true',
        autoHideDuration: 3000,
      });
    } else {
      if (temp.username === tempUser.username) {
        enqueueSnackbar('❗ You Cannot Comment On Owned Projects', {
          style: { background: 'white', color: 'red' },
          preventDuplicate: 'true',
          autoHideDuration: 3000,
        });
      } else {
        setShow1(true);
      }
    }
  };
  const handleFaq = () => {
    if (jwt.length === 0) {
      enqueueSnackbar('❗ You Must Login First', {
        style: { background: 'white', color: 'red' },
        preventDuplicate: 'true',
        autoHideDuration: 3000,
      });
    } else {
      if (temp.username === tempUser.username) {
        enqueueSnackbar('❗ You Cannot Question On Owned Projects', {
          style: { background: 'white', color: 'red' },
          preventDuplicate: 'true',
          autoHideDuration: 3000,
        });
      } else {
        setShow2(true);
      }
    }
  };
  const handleBookMark = (project) => {
    if (jwt.length === 0) {
      enqueueSnackbar('❗ You Must Login First', {
        style: { background: 'white', color: 'red' },
        preventDuplicate: 'true',
        autoHideDuration: 3000,
      });
    } else {
      bookMark({
        variables: {
          bookMark: {
            username: tempUser.username,
            project_name: project.project_name,
          },
        },
      })
        .then((res) => {
          if (res) {
            userOptions.refetch();
          }
        })
        .catch((err) => {
          enqueueSnackbar(`❗ ${err.message}`, {
            style: {
              background: 'white',
              color: 'red',
            },
          });
        });
    }
  };
  const renderTooltip = (props) => (
    <Tooltip id='button-tooltip' {...props}>
      {pName}
    </Tooltip>
  );
  const projects =
    projData &&
    projData.map((project) => {
      return (
        <OverlayTrigger
          placement='auto'
          delay={{ show: 250, hide: 100 }}
          project={project.project_name}
          key={project.project_id}
          onEnter={() => handleHover(project)}
          overlay={renderTooltip}
        >
          <div
            className='col-md-3 rounded projects'
            style={{
              marginTop: 20,
              marginLeft: 100,
              boxShadow: '0 2px 20px lightgray',
            }}
            onClick={() => handleShow(project)}
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
        </OverlayTrigger>
      );
    });
  return (
    <div>
      <div className='d-flex justify-content-center my-4'>
        <Card className='w-50' style={{ boxShadow: '0 2px 10px lightgray' }}>
          <Card.Body>
            <Card.Text className='d-flex justify-content-center'>
              <span
                className='mx-3 pe-5'
                style={{ borderRight: '2px solid black' }}
              >
                <b style={{ color: 'darkgreen' }}>Pledged Projects: </b>
                {count.pledgedProjects}
              </span>
              <span
                className='mx-3 pe-5'
                style={{ borderRight: '2px solid black' }}
              >
                <b style={{ color: 'darkgreen' }}>Amount Raised: </b>
                Rs.{count.pledgesAmount}
              </span>
              <span className='mx-3 ps-4'>
                <b style={{ color: 'darkgreen' }}>Pledges: </b>
                {count.totalPledges}
              </span>
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
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
          style={{
            maxHeight: 650,
          }}
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
            <ul
              className='m-5 border-start border-5 border-danger'
              style={{ listStyleType: 'circle' }}
            >
              <li>Description: {temp.description}</li>
              <li>End Date: {temp.end_date}</li>
              <li>
                Owner: <a href='/'>{temp.username}</a>
              </li>
              <li>Amount To Reach: {temp.target_amount}</li>
              <li>Total Pledged Amount: {temp.pledge_amount}</li>
              <li>Catagory: {temp.catagory}</li>
              <li>{'Likes: ' + temp.likes}</li>
            </ul>
          </Modal.Body>
          <Modal.Body>
            <Tabs
              defaultActiveKey='comments'
              id='justify-tab-example'
              className='mb-3'
              justify
            >
              <Tab eventKey='comments' title='Comments'>
                <ol>
                  {temp.comments && temp.comments.length === 0
                    ? 'There Are No Comments For This Project Yet'
                    : temp.comments &&
                      temp.comments.map((comment) => (
                        <li key={`${comment}`}>{comment}</li>
                      ))}
                </ol>
              </Tab>
              <Tab eventKey='faq' title='FAQs'>
                {que ? que : 'Be The First To Ask A Question!'}
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer className='justify-content-center'>
            <Button variant='info' onClick={handleFaq}>
              Ask A Question
            </Button>
            <Button variant='dark' onClick={handleComment}>
              Comment
            </Button>
            <Button
              variant={
                tempUser.likedProjects &&
                tempUser.likedProjects.includes(temp.project_name)
                  ? 'secondary'
                  : 'light'
              }
              onClick={handleLike}
            >
              {likeOpt.loading ? (
                <Spinner size='sm' animation='border' />
              ) : (
                <>
                  {tempUser.likedProjects &&
                  tempUser.likedProjects.includes(temp.project_name)
                    ? 'Liked ❤️'
                    : 'Like 👍🏻'}
                </>
              )}
            </Button>
          </Modal.Footer>
          <Modal.Footer>
            <Button
              variant={
                tempUser.bookmarks &&
                tempUser.bookmarks.includes(temp.project_name)
                  ? 'success'
                  : 'light'
              }
              style={{
                boxShadow: '0px 0px 5px 1px lightgray',
              }}
              onClick={() => handleBookMark(temp)}
            >
              {bookmarkOption.loading ? (
                <Spinner size='sm' animation='border' variant='secondary' />
              ) : (
                <>
                  {tempUser.bookmarks &&
                  tempUser.bookmarks.includes(temp.project_name)
                    ? 'Bookmarked ✓'
                    : 'Bookmark 📑'}
                </>
              )}
            </Button>
            <Button variant='danger' onClick={handleClose}>
              Close
            </Button>
            <Button
              variant='warning'
              onClick={() => {
                handlePledge(temp);
              }}
            >
              Back This Project
            </Button>
            {showButton && jwt && (
              <Form>
                <Form.Control
                  type='number'
                  value={amount === 0 ? 0 : amount}
                  placeholder='Pledge An Amount'
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                  min={0}
                />
              </Form>
            )}
            {amount && jwt && (
              <GooglePayButton
                environment='TEST'
                paymentRequest={{
                  apiVersion: 2,
                  apiVersionMinor: 0,
                  allowedPaymentMethods: [
                    {
                      type: 'CARD',
                      parameters: {
                        allowedAuthMethods: ['CRYPTOGRAM_3DS', 'PAN_ONLY'],
                        allowedCardNetworks: ['VISA', 'MASTERCARD'],
                      },
                      tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: {
                          gateway: 'example',
                          gatewayMerchantId: 'exampleGatewayMerchantId',
                        },
                      },
                    },
                  ],
                  merchantInfo: {
                    merchantId: '12345678901234567890',
                    merchantName: 'Apr',
                  },
                  transactionInfo: {
                    totalPriceLabel: `The Payment is of $ ${amount}`,
                    totalPriceStatus: 'FINAL',
                    totalPrice: `${amount}`,
                    countryCode: 'US',
                    currencyCode: 'USD',
                  },
                }}
                onLoadPaymentData={(payment) => {
                  if (payment) {
                    pleadgeFunc({
                      variables: {
                        pleadge: {
                          pledge_amount: +amount,
                          project_name: temp.project_name,
                          username: tempUser.username,
                        },
                      },
                    })
                      .then((res) => {
                        enqueueSnackbar('Payment Success of Rs. ' + amount, {
                          variant: 'success',
                        });
                        dispatch(
                          updateProject({
                            ...temp,
                            pledge_amount: temp.pledge_amount + +amount,
                          })
                        );
                        dispatch(updateCount(+amount));
                        dispatch(addPledge(+amount));
                        setAmount('');
                        setShowButton(false);
                      })
                      .catch((err) => {
                        enqueueSnackbar(`❗ ${err.message}`, {
                          style: { color: 'red', background: 'white' },
                        });
                      });
                  }
                }}
                buttonSizeMode='fill'
                buttonType='pay'
              />
            )}
          </Modal.Footer>
        </Modal>
        <Modal show={show1} onHide={handleClose1} centered>
          <Modal.Header closeButton>
            <Modal.Title>Comment on {temp.project_name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <Form.Group>
                <Form.Control
                  type='text'
                  placeholder='Enter Your Comment Here'
                  value={comm}
                  onChange={(e) => {
                    setComm(e.target.value.trimStart());
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleClose1}>
              Close
            </Button>
            <Button variant='primary' onClick={handleComment1}>
              {commentOpt.loading ? (
                <Spinner size='sm' animation='border' />
              ) : (
                'Comment'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={show2} onHide={handleClose2} centered>
          <Modal.Header closeButton>
            <Modal.Title>For {temp.project_name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <Form.Group>
                <Form.Control
                  type='text'
                  placeholder='Enter A Question'
                  value={ques}
                  onChange={(e) => {
                    setques(e.target.value.trimStart());
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleClose2}>
              Close
            </Button>
            <Button variant='primary' onClick={handleQues}>
              {quesOpt.loading ? (
                <Spinner size='sm' animation='border' />
              ) : (
                'Ask'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Projects;
