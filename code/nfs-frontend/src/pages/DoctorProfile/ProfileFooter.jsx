
import React from 'react';
import './ProfileFooter.css';

function ProfileFooter() {
    return (
        <footer className="profile-custom-footer">
            <div className="footer-container">

                { }
                <div className="footer-price-section">
                    <span className="price-label">سعر الجلسة</span>
                    <div className="price-value-wrapper">
                        <span className="currency">ج.م</span>
                        <span className="price-number">250</span>
                    </div>
                </div>

                { }
                <div className="footer-action-section">
                    <button className="book-now-btn">احجز الجلسة الآن</button>
                </div>

            </div>
        </footer>
    );
}

export default ProfileFooter;