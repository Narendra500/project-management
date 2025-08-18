import { verifyEmail } from "#services/authServices";
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router';

export default function VerifyEmailPage() {
    // status : 'verifying', 'success', or 'error'
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your email, please wait...');
    // react mounts, unmounts and mounts a component in strict mode so two requests are sent so using a ref to avoid that.
    const verificationRequestSent = useRef(false);

    // Get the token from the URL using React Router's useParams hook
    const { token } = useParams();

    useEffect(() => {
        if (verificationRequestSent.current) return;
        // This function will run once when the component mounts
        const verifyToken = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No verification token found.');
                return;
            }
            // in strict mode the second useEffect runs before the async call is finished sending two requests, 
            // thus always place the ref before the async call to avoid running useEffect twice.
            verificationRequestSent.current = true; // change to true to avoid requests after the initial request

            // Make the API call to your backend verification endpoint
            const response = await verifyEmail(token);

            if (response.success) {
                setStatus('success');
                setMessage(response.message);
            } else {
                setStatus('error');
                setMessage(response.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        verifyToken();
    }, [token]); // Dependency array ensures this runs only when token or navigate changes

    // Render different UI based on the current status
    return (
        <div className="bg-gray-950 flex flex-col items-center justify-center min-h-screen text-center">
            {status === 'verifying' && (
                <>
                    <h1 className="text-6xl font-bold">Verifying...</h1>
                    <p className="mt-4 text-3xl text-gray-400">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <h1 className="text-6xl font-bold text-green-500">Success!</h1>
                    <p className="mt-4 text-3xl text-gray-400">{message}</p>
                    <Link to="/profile/me" className="mt-6 text-3xl text-purple-400 underline">
                        Go to Profile Page
                    </Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <h1 className="text-6xl font-bold text-red-500">Verification Error</h1>
                    <p className="mt-4 text-3xl text-gray-400">{message}</p>
                    <Link to="/profile/me" className="mt-6 text-3xl text-purple-400 underline">
                        Go to Profile Page
                    </Link>
                </>
            )
            }
        </div >
    );
}
