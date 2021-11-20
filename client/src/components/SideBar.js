import React from 'react';
import { MDBBtn, MDBIcon, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import axios from 'axios';

import '../Sidebar.css'

import {
	MDBTabs,
	MDBTabsItem
} from 'mdb-react-ui-kit';

import {
	Link,
	NavLink
} from "react-router-dom";

export default function SideBar({ app, setUser, handleSideBar }) {

	const handleLogOut = async () => {
		if (app.currentUser.providerType == "anon-user") {
			axios({
				method: "POST",
				url: "/LogOutDemo",
				data: {
					currentID: app.currentUser.id
				}
			}).catch(err => {
				console.log(err)
			})
			await app.currentUser.logOut();
		} else {
			await app.currentUser.logOut();
		}
		setUser(app.currentUser)
	}

	return (
		<MDBCol md='2' sm='3' size='5'>
			<div className="sideBar bg-light shadow-1-strong">
				<MDBCol md='12'>
					<MDBRow>
						<div className='d-flex align-items-end flex-column mb-3'>
							<MDBBtn className='text-dark' color='light' onClick={handleSideBar}>
								<MDBIcon fas icon="chevron-left" />
							</MDBBtn>
						</div>
					</MDBRow>
					<MDBRow>
						<MDBCol size='12'>
							<div className='d-flex justify-content-center flex-column align-items-center'>
								<MDBTabs pills className='flex-column text-center'>
									<MDBTabsItem >
										<NavLink to="/" >
											<MDBBtn>
												<MDBIcon fas icon="home" />{' '}Home
											</MDBBtn>
										</NavLink>
									</MDBTabsItem>
									<MDBTabsItem>
										<Link to="/users" >
											<MDBBtn>
												<MDBIcon fas icon="users" />{' '}Users
											</MDBBtn>
										</Link>
									</MDBTabsItem>
									<MDBTabsItem>
										<Link to="/profile">
											<MDBBtn>
												<MDBIcon fas icon="user-circle" />{' '}Profile
											</MDBBtn>
										</Link>
									</MDBTabsItem>
									<MDBTabsItem>
										<Link to="/subscriptions">
											<MDBBtn >
												<MDBIcon fas icon="users" />{' '}Subs
											</MDBBtn>
										</Link>
									</MDBTabsItem>
								</MDBTabs>
								<MDBBtn outline className='mx-2 top-0 end-0' color='danger' onClick={handleLogOut}>Log Out</MDBBtn>
							</div>
						</MDBCol>
					</MDBRow>
				</MDBCol>
			</div>
		</MDBCol>
	);
}