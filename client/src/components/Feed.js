import React from "react";
import axios from 'axios';

import '../Feed.css'

import {
    MDBTypography,
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardImage,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBSpinner
} from 'mdb-react-ui-kit';

export default function Feed({ app, user }) {
    const [posts, setPosts] = React.useState();

    React.useEffect(() => {
        let mounted = true
        axios({
            method: "POST",
            url: "http://localhost:5000/retrieve/feed",
            data: {
                currentID: app.currentUser.id
            }
        }).then(res => {
            if (mounted) {
                setPosts(res.data)
            }
        }).catch(err => {
            console.log(err)
        })

        return () => mounted = false;

    }, []);

    const handleButton = (id) => {
        posts.some(post => {
            if (post._id == id) {
                axios({
                    method: "POST",
                    url: "http://localhost:5000/openPDF",
                    responseType: "blob",
                    data: {
                        postID: post._id
                    }
                }).then(response => {
                    const file = new Blob([response.data], {
                        type: "application/pdf"
                    });
                    const fileURL = URL.createObjectURL(file);
                    window.open(fileURL);
                }).catch(error => {
                    console.log(error);
                });
            }
        })
    }

    const displayPosts =
        posts ?
            <MDBContainer>
                {
                    posts == "empty" ?
                        <MDBTypography tag='h3'>No posts to see, go to users and follow someone</MDBTypography>
                        :
                        <MDBContainer>
                            <MDBRow size='12' className='row-cols-1 row-cols-md-2 row-cols-lg-3 ms-3'>
                                {posts.map(el =>
                                    <MDBCol key={el._id} className='mb-4'>
                                        <MDBCard size='12'>
                                            <MDBContainer className="text-break">
                                                <MDBRow size='12'className='text-center'>
                                                    <MDBCol md='12'>
                                                        <MDBCardBody className="post" onClick={() => handleButton(el._id)}>
                                                            <MDBCardTitle >{el.name}</MDBCardTitle>
                                                        </MDBCardBody>
                                                    </MDBCol>
                                                    <MDBCol md='4' className='text-center'>
                                                        <MDBCardImage
                                                            src={el._userPictureUrl}
                                                            alt='...'
                                                            fluid
                                                            onClick={() => handleButton(el._id)}
                                                            className="post img-fluid rounded"
                                                        />
                                                        <MDBCardText className="post" onClick={() => handleButton(el._id)}>{el._userName}</MDBCardText>
                                                    </MDBCol>
                                                    <MDBCol>
                                                        <MDBCardBody className="post" onClick={() => handleButton(el._id)}>
                                                            <MDBCardText >{el.date}</MDBCardText>
                                                        </MDBCardBody>
                                                    </MDBCol>
                                                </MDBRow>
                                            </MDBContainer>
                                        </MDBCard>
                                    </MDBCol>
                                )}
                            </MDBRow>
                        </MDBContainer>
                }
            </MDBContainer>
            :
            <MDBSpinner className='me-2' style={{ width: '3rem', height: '3rem' }} role='status'>
                <span className='visually-hidden'>Loading...</span>
            </MDBSpinner>

    return (
        <div>
            {displayPosts}
        </div>
    );
}