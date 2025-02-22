import React from 'react';
import './footer.css';
import nvidia from './../assets/nvidia-badge.jpg';

function Footer() {
    return (
        <footer>
            
                <img
                    src={nvidia}
                    alt="Nvidia Inception Badge"
                    class="small"
                />

                <p>&copy; 2024 Akeyreu LLC. All rights reserved.</p>
          
        </footer>
    );
}

export default Footer;