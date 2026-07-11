import React from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../Components/Sidebar/Sidebar";
import Dashboard from "../Dashboard/Dashboard";
import "./DoctorWork.css";

function DoctorWork() {
    return (
        <div className="doctor-work-page">
            <Header />

            <main className="doctor-work-main">
                <div className="doctor-work-container">
                    { }
                    <Sidebar activeTab="dashboard" />

                    <section className="content-area">
                        <Dashboard />
                    </section>
                </div>
            </main>
        </div>
    );
}

export default DoctorWork;
