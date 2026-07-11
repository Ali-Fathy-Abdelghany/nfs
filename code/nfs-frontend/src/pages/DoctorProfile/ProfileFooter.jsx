import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileFooter.css";

function ProfileFooter({ doctor, hourlyRate = 250 }) {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate("/dashboard", {
      state: {
        targetTab: "booking",
        preselectedDoctor: doctor,
      },
    });
  };

  return (
    <footer className="profile-custom-footer">
      <div className="footer-container">
        <div className="footer-price-section">
          <span className="price-label">سعر الجلسة</span>
          <div className="price-value-wrapper">
            <span className="currency">ج.م</span>
            <span className="price-number">{hourlyRate}</span>
          </div>
        </div>

        <div className="footer-action-section">
          <button type="button" className="book-now-btn" onClick={handleBookNow}>
            احجز الجلسة الآن
          </button>
        </div>
      </div>
    </footer>
  );
}

export default ProfileFooter;
