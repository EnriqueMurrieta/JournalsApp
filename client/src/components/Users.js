import React from "react";
import axios from 'axios';

import '../Users.css'

import {
	MDBBtn,
	MDBContainer,
	MDBRow,
	MDBCol,
	MDBCard,
	MDBCardImage,
	MDBCardText,
	MDBSpinner
} from 'mdb-react-ui-kit';

let usersToRender = []

export default function Users({ app }) {
	const [users, setUsers] = React.useState();
	const [yourSubs, setYourSubs] = React.useState();
	const [renderUpdate, setRenderUpdate] = React.useState();

	React.useEffect(() => {
		setRenderUpdate(true)
	})

	React.useEffect(() => {
		let mounted = true;
		axios({
			method: "POST",
			url: "/GetSubs/GetUsersTest",
			data: {
				currentID: app.currentUser.id
			}
		}).then(res => {
			if (mounted) {
				usersToRender = res.data
				setUsers(res.data)
			}
		}).catch(err => {
			console.log(err)
		});

		return () => mounted = false;

	}, [yourSubs]);

	const handleSubscription = async (subscribeToID, subscribeToName, subscribeToPicture, isCurrentlySubscribed) => {
		usersToRender.some(user => {
			if (user._id == subscribeToID) {
				user.loading = true;
				return true
			}
		})
		axios({
			method: "POST",
			url: "http://localhost:5000/Subscriptions/Add",
			data: {
				currentID: app.currentUser.id,
				subscribeToID,
				subscribeToName,
				subscribeToPicture,
				isCurrentlySubscribed
			}
		}).then(res => {
			usersToRender.map(user => {
				if (user._id == subscribeToID) {
					if (user.currentUserSubscribed == true) {
						user.currentUserSubscribed = false;
					} else {
						user.currentUserSubscribed = true;
					}
				}
			})

			setRenderUpdate();
			usersToRender.some(user => {
				if (user._id == subscribeToID) {
					user.loading = false
					return true
				}
			})
		}).catch(err => {
			console.log(err)
		})
	}

	const handleButton = () => { }

	const displayUsers =
		users ?
			<MDBContainer>
				<MDBRow className='row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 ms-3'>
					{usersToRender.map(el =>
						<MDBCol key={el._id} className='mb-4'>
							<MDBCard>
								<MDBContainer className="text-break">
									<MDBRow className='text-center'>
										<MDBCol md='12' >
											<MDBCardImage
												src={el.pictureUrl}
												alt='...'
												fluid
												onClick={() => handleButton(el._id)}
												className="img-fluid rounded img"
											/>
											<MDBCardText onClick={() => handleButton(el._id)}>{el.name}</MDBCardText>
										</MDBCol>
										<MDBCol md='12'>
											{
												el.loading == true ?
													<MDBSpinner className='me-2' style={{ width: '3rem', height: '3rem' }} role='status'>
														<span className='visually-hidden'>Loading...</span>
													</MDBSpinner>
													:
													(
														el.currentUserSubscribed == true ?
															<div className='text-center'>
																<MDBBtn id={el._id} outline color='danger' onClick={() => handleSubscription(el._id, el.name, el.pictureUrl, el.currentUserSubscribed)}>Unsubscribe</MDBBtn>
															</div>
															:
															<div className='text-center'>
																<MDBBtn id={el._id} onClick={() => handleSubscription(el._id, el.name, el.pictureUrl)}>Subscribe</MDBBtn>
															</div>
													)
											}
										</MDBCol>
									</MDBRow>
								</MDBContainer>
							</MDBCard>
						</MDBCol>
					)}
				</MDBRow>
			</MDBContainer>
			:
			<MDBSpinner className='me-2 ms-4 text-center' style={{ width: '3rem', height: '3rem' }} role='status'>
				<span className='visually-hidden'>Loading...</span>
			</MDBSpinner>

	return (
		<div>
			<MDBContainer className='ms-4 text-center'>
				<h2>Users</h2>
			</MDBContainer>
			{displayUsers}
		</div>
	);
}