import React from "react";
import axios from 'axios';

import '../Subscriptions.css'

import {
	MDBBtn,
	MDBContainer,
	MDBRow,
	MDBCol,
	MDBCard,
	MDBCardImage,
	MDBCardText,
	MDBSpinner,
} from 'mdb-react-ui-kit';

let usersToRender = []

export default function Subscriptions({ app }) {

	const [users, setUsers] = React.useState();
	const [renderUpdate, setRenderUpdate] = React.useState();
	const [yourSubs, setYourSubs] = React.useState();

	React.useEffect(() => {
		setRenderUpdate(true)
	})

	React.useEffect(() => {
		let mounted = true;
		axios({
			method: "POST",
			url: "/GetSubs",
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
		})

		return () => mounted = false;

	}, [yourSubs]);

	const handleSubscription = async (subscribeToID, subscribeToName, subscribeToPicture, isCurrentlySubscribed) => {
		const loader = await usersToRender.some(user => {
			if (user.id == subscribeToID) {
				user.loading = true
				return true
			}
		})
		axios({
			method: "POST",
			url: "/Subscriptions/Add",
			data: {
				currentID: app.currentUser.id,
				subscribeToID,
				subscribeToName,
				subscribeToPicture,
				isCurrentlySubscribed
			}
		}).then(res => {
			usersToRender.map(user => {
				if (user.id == subscribeToID) {
					if (user.currentUserSubscribed == true) {
						user.currentUserSubscribed = false;
					} else {
						user.currentUserSubscribed = true;
					}
				}
			})
			setRenderUpdate();
			usersToRender.some(user => {
				if (user.id == subscribeToID) {
					user.loading = false
					return true
				}
			})
		}).catch(err => {
			console.log(err)
		})
	}

	const handleButton = () => {
	}

	const displaySubscriptions =
		users ?
			<MDBContainer>
				<MDBRow /*size='12'*/ className='row-cols-1 row-cols-md-2 row-cols-lg-2 ms-3'>
					{usersToRender.map(el =>
						<MDBCol key={el.id} className='mb-4'>
							<MDBCard /*size='12'*/>
								<MDBContainer className="text-break">
									<MDBRow /*size='12'*/ className='text-center'>
										<MDBCol md='12'>
											<MDBCardImage
												src={el.pictureUrl}
												alt='...'
												fluid
												onClick={handleButton}
												className="img img-fluid rounded"
											/>
											<MDBCardText /*className="subs"*/ onClick={() => handleButton(el.id)}>{el.name}</MDBCardText>
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
																<MDBBtn id={el.id} outline color='danger' onClick={() => handleSubscription(el.id, el.name, el.pictureUrl, el.currentUserSubscribed)}>Unsubscribe</MDBBtn>
															</div>
															:
															<div>
																<MDBBtn id={el.id} onClick={() => handleSubscription(el.id, el.name, el.pictureUrl)}>Subscribe</MDBBtn>
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
				<h2>Subscriptions</h2>
			</MDBContainer>
			{displaySubscriptions}
		</div>
	);
}