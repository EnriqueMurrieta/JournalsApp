import React from 'react';
import { MDBFooter, MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';

export default function Footer() {
	return (
		<MDBFooter className='text-center'>
			<MDBContainer className='p-4'>
				<MDBRow>
					<MDBCol lg='4' md='6' className='mb-4 mb-md-0'>
						<h5 className='text-uppercase'>Portfolio</h5>
						<ul className='list-unstyled mb-0'>
							<li>
								<a href='https://portafolio-2bd12.firebaseapp.com/' className='text-dark'>
									portafolio-2bd12.firebaseapp.com
								</a>
							</li>
						</ul>
					</MDBCol>
					<MDBCol lg='4' md='6' className='mb-4 mb-md-0'>
						<h5 className='text-uppercase'>LinkedIn</h5>
						<ul className='list-unstyled'>
							<li>
								<a href='https://www.linkedin.com/in/enrique-murrieta-acu%C3%B1a-a04231123/' className='text-dark'>
									linkedin.com/in/enrique-murrieta-acuña-a04231123
								</a>
							</li>
						</ul>
					</MDBCol>
					<MDBCol lg='4' md='6' className='mb-4 mb-md-0'>
						<h5 className='text-uppercase'>Github</h5>
						<ul className='list-unstyled mb-0'>
							<li>
								<a href='https://github.com/EnriqueMurrieta' className='text-dark'>
									github.com/EnriqueMurrieta
								</a>
							</li>
						</ul>
					</MDBCol>
				</MDBRow>
			</MDBContainer>
			<div className='text-center p-3 bg-light'>
				&copy; {new Date().getFullYear()}. {' '}
				Murrieta Acuna, Esteban Enrique
			</div>
		</MDBFooter>
	);
}