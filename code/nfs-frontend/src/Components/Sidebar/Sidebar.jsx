import React from "react";
import "./Sidebar.css";

function Sidebar({ activeTab }) {
    return (
        <aside className="sidebar">
            <ul className="sidebar-menu">
                <li
                    className={`menu-item ${activeTab === "dashboard" ? "active" : ""}`}
                >
                    <i className="fa-solid fa-chart-pie"></i>
                    <span>لوحة القيادة</span>
                </li>
                <li className={`menu-item ${activeTab === "patients" ? "active" : ""}`}>
                    <i className="fa-solid fa-user-group"></i>
                    <span>المرضى</span>
                </li>
                <li className={`menu-item ${activeTab === "timetable" ? "active" : ""}`}>
                    <i className="fa-solid fa-calendar-days"></i>
                    <span>الجدول الزمني</span>
                </li>
                <li
                    className={`menu-item ${activeTab === "analysis" ? "active" : ""}`}
                >
                    <i className="fa-solid fa-chart-line"></i>
                    <span>التحليلات</span>
                </li>
            </ul>

            
        </aside>
    );
}

export default Sidebar;
