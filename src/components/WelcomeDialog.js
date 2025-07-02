import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/WelcomeDialog.css';

const WelcomeDialog = ({ onClose }) => {
  return (
    <div className="welcome-dialog-overlay">
      <div className="welcome-dialog">
        <h2>Byenveni!</h2>
        <p>Jwèt sa a 100% ayisyen.</p>
        <p className="version">Vèsyon: 0.1.0</p>
        <p className="developer">Devlope pa: LOUVENS Louis</p>
        <Link to="/category" className="play-button" onClick={onClose}>
          Jwe
        </Link>
      </div>
    </div>
  );
};

export default WelcomeDialog;