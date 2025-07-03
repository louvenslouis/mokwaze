import React, { useEffect, useState } from 'react';
import '../styles/SplashScreen.css';
import marelLogo from '../marel.png'; // Assuming marel.png is in the src folder

const SplashScreen = ({ onFinished }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      // Wait for the fade-out transition to complete before calling onFinished
      setTimeout(onFinished, 500); // This duration should match the CSS transition time
    }, 2000); // Display for 2 seconds

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className={`splash-screen ${!visible ? 'hidden' : ''}`}>
      <img src={marelLogo} alt="Marel Studio Logo" />
    </div>
  );
};

export default SplashScreen;
