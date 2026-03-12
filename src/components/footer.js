import React from 'react';
import './footer.css';
import nvidia from './../assets/nvidia-badge.jpg';

function Footer() {
    return (
        <footer>
            
                <img
                    src={nvidia}
                    alt="Nvidia Inception Badge"
                    className="small"
                />

                <p>&copy; {new Date().getFullYear()} Enactive. All rights reserved.</p>
          
        </footer>
    );
}

export default Footer;