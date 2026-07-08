import React from "react";
import ProfileHeader from "../../Components/Header/Header";
import ProfileFooter from "../../Components/Footer/Footer";
import Sidebar from "../../Components/Sidebar/Sidebar";
import Dashboard from "../../Components/Dashboard/Dashboard";
import "./DoctorWork.css";

function DoctorWork() {
    return (
        <div className="doctor-work-page">
            <ProfileHeader />

            <main className="doctor-work-main">
                <div className="doctor-work-container">
                    { }
                    <Sidebar activeTab="dashboard" />

                    <section className="content-area">
                        <Dashboard />
                    </section>
                </div>
            </main>

            <ProfileFooter />
        </div>
    );
}

export default DoctorWork;
