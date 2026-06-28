
import React from 'react';
import './ProfileHeader.css';

function ProfileHeader() {
    const handleBack = () => {
        console.log("رجوع للصفحة السابقة");
    };

    return (
        <header className="profile-header">
            { }


            { }
            <div className="header-left-side">
                <span className="brand-name">نفس</span>
                <button className="profile-icon-btn back-btn" onClick={handleBack} title="رجوع">
                    <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>

            <div className="header-right-side">
                <button className="profile-icon-btn" title="حفظ في المفضلة">
                    <i className="fa-regular fa-heart"></i>
                </button>
                <button className="profile-icon-btn" title="مشاركة">
                    <i className="fa-solid fa-share-nodes"></i>
                </button>
            </div>

        </header>
    );
}

export default ProfileHeader;