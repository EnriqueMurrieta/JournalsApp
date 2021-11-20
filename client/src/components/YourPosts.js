import React from 'react';
import axios from 'axios';

import '../YourPosts.css'

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

export default function YourPosts({ app }) {
	const [userInfo, setuserInfo] = React.useState();
	const [retrieve, setRetrieve] = React.useState();

	React.useEffect(() => {
		let mounted = true
		axios({
			method: "POST",
			url: "http://localhost:5000/GetProfile",
			headers: {
				"Content-Type": "application/json"
			},
			data: {
				currentID: app.currentUser.id
			}
		}).then(res => {
			if (mounted) {
				setuserInfo(res.data)
			}
		})
		return () => mounted = false
	}, [])

	React.useEffect(() => {
		let mounted = true
		if (app.currentUser.providerType == "anon-user") {
			axios({
				method: "POST",
				url: "http://localhost:5000/RetrieveAnonPosts",
				headers: {
					"Content-Type": "application/json"
				}
			}).then(res => {
				if (mounted) {
					setRetrieve(res.data)
				}
			});
		} else {
			axios({
				method: "POST",
				url: "http://localhost:5000/retrieve",
				headers: {
					"Content-Type": "application/json"
				},
				data: {
					userID: app.currentUser.id
				}
			}).then(res => {
				if (mounted) {
					setRetrieve(res.data)
				}
			});
		}
		return () => mounted = false;
	}, [])

	const handleButton = (id) => {
		retrieve.some(post => {
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

	const RetrievedUser =
		userInfo ?
			<div className="ms-5">
				<MDBContainer className="text-break text-center p-4">
					<MDBRow className="text-center">
						<MDBCard>
							<MDBCol className='text-center'>
								<MDBCardImage
									src={userInfo.pictureUrl}
									alt='...'
									fluid
									className="img img-fluid rounded"
								/>
								<MDBCardText className="post">{userInfo.name}</MDBCardText>
								<MDBCardText className="post">{userInfo.email}</MDBCardText>
							</MDBCol>
						</MDBCard>
					</MDBRow>
				</MDBContainer>
			</div>
			:
			<MDBSpinner className='me-2' style={{ width: '3rem', height: '3rem' }} role='status'>
				<span className='visually-hidden'>Loading...</span>
			</MDBSpinner>

	const RetrievedItems =
		retrieve ?
			<MDBContainer>
				{
					retrieve == "empty" ?
						<MDBTypography tag='h3'>No posts to see, go to users and follow someone</MDBTypography>
						:
						<MDBContainer>
							<MDBRow /*size='12'*/ className='row-cols-1 row-cols-md-2 row-cols-lg-3 ms-3'>
								{retrieve.map(el =>
									<MDBCol key={el._id} className='mb-4'>
										<MDBCard /*size='12'*/>
											<MDBContainer className="text-break">
												<MDBRow /*size='12'*/ className='text-center'>
													<MDBCol md='12'>
														<MDBCardBody className="post" onClick={() => handleButton(el._id)}>
															<MDBCardTitle >{el.name}</MDBCardTitle>
														</MDBCardBody>
													</MDBCol>
													<MDBCol md='12'>

														<MDBCardImage
															src={el._userPictureUrl}
															alt='...'
															fluid
															onClick={() => handleButton(el._id)}
															className="img-fluid rounded img"
														/>
														<MDBCardText className="post" onClick={() => handleButton(el._id)}>{el._userName}</MDBCardText>
													</MDBCol>
													<MDBCol>
														<MDBCardBody className="post" onClick={() => handleButton(el._id)}>
															<MDBCardText>{el.date}</MDBCardText>
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
			{RetrievedUser}
			<MDBTypography variant='h1' className='ms-3 text-center'>Your Posts</MDBTypography>
			{RetrievedItems}
		</div>
	);
}