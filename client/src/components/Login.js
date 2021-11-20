//Photo by Johannes Plenio from Pexels

import React from "react";
import axios from 'axios';
import * as Realm from 'realm-web';
import '../Login.css';
import Footer from './Footer';

import { MDBBtn, MDBIcon, MDBTypography, MDBContainer, MDBRow, MDBCol, MDBSpinner } from 'mdb-react-ui-kit';


const redirectUri = "https://gentle-hamlet-24623.herokuapp.com/about";
const credentials = Realm.Credentials.google(redirectUri);

export default function Login({ setUser, app }) {
	const [loading, setLoading] = React.useState(false);

	const handleGoogleLogIn = async () => {
		setLoading(true)
		app.logIn(credentials).then(async user => {
			let userInfo = user._profile.data
			userInfo._id = user.id
			try {
				axios({
					method: "POST",
					url: "/AuthDB",
					data: {
						auth: { userInfo }
					}
				}).then(res => {
					setUser(res.data)
				})
			} catch (err) {
				console.log(err)
			} finally {
				console.log(`Logged in with id: ${app.currentUser.id}`);
			}
		})
	}

	const loginAnonymous = async () => {
		try {
			const user = await app.logIn(Realm.Credentials.anonymous());
		} catch (err) {
			console.log(err)
		} finally {
			axios({
				method: "POST",
				url: "/demoUser",
				data: {
					currentID: app.currentUser.id
				}
			}).then(res => {
				setUser(app.currentUser)
			}).catch(err => {
				console.log(err)
			})
		}
	};

	const text = {
		textTransform: 'lowercase'
	}

	return (
		<div>
			<div className="big-image">
				<MDBContainer>
					<MDBRow>
						<MDBCol md='12'>
							<MDBTypography tag='div' className='display-4 pb-3 mb-3 border-bottom text-break text-wrap'/**/>
								Researcher's Journals
							</MDBTypography>
							{
								loading ?
									<MDBSpinner className='me-2' style={{ width: '6rem', height: '6rem' }} role='status'>
										<span className='visually-hidden'>Loading...</span>
									</MDBSpinner>
									:
									null
							}
						</MDBCol>
						<MDBCol md='12 d-flex align-items-start'>
							<div>
								<MDBBtn style={{ fontWeight: "bold" }} onClick={loginAnonymous}>
									D<span style={text}>emo </span>U<span style={text}>ser</span>
								</MDBBtn>
								<MDBBtn className='m-1' color='danger' style={{ fontWeight: "bold" }} onClick={handleGoogleLogIn}>
									L<span style={text}>og in with </span>
									<MDBIcon fab icon='google' size='2x' /><span style={text}>oogle</span>
								</MDBBtn>
							</div>
						</MDBCol>
						<MDBCol md='12 d-flex align-items-end flex-column mb-3'>
							<div className='description'>
								<MDBTypography className='lead mb-0 fw-bold'>
									Contribute to the community uploading your research's journal
								</MDBTypography>
								<MDBTypography className='lead mb-0 fw-bold'>
									Subscribe to researchers on the platform
								</MDBTypography>
								<MDBTypography className='lead mb-0 fw-bold'>
									Access their posted Journals
								</MDBTypography>
							</div>
						</MDBCol>
					</MDBRow>
				</MDBContainer>
			</div>
			<Footer />
		</div>
	);
}